window.CashierBillsDashboard = (() => {
  const API_BASE = "";

  const els = {};
  let debounceTimer = null;
  let serverBillsCache = [];

  function init() {
    els.searchInput = document.getElementById("billSearchInput");
    els.statusFilter = document.getElementById("billStatusFilter");
    els.utilityFilter = document.getElementById("utilityTypeFilter");

    // FIX: match HTML id (customerTypeFilter)
    els.customerTypeFilter = document.getElementById("customerTypeFilter");

    els.limitSelect = document.getElementById("billLimit");
    els.list = document.getElementById("billList");
    els.hint = document.getElementById("billListHint");
    els.refreshBtn = document.getElementById("refreshBillsBtn");
    els.hideFullyPaid = document.getElementById("hideFullyPaid");

    if (!els.list) return;

    wireEvents();
    loadBills();
  }

  function wireEvents() {
    els.searchInput?.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyClientFilter, 250);
    });

    els.statusFilter?.addEventListener("change", applyClientFilter);
    els.utilityFilter?.addEventListener("change", applyClientFilter);
    els.customerTypeFilter?.addEventListener("change", applyClientFilter);
    els.hideFullyPaid?.addEventListener("change", applyClientFilter);

    els.limitSelect?.addEventListener("change", loadBills);
    els.refreshBtn?.addEventListener("click", loadBills);
  }

  async function loadBills() {
    setHint("Loading bills...");
    renderLoader();

    const limit = parseInt(els.limitSelect?.value || "20", 10);
    const token = localStorage.getItem("token");

    try {
      const url = new URL(API_BASE + "/api/cashier/bills", window.location.origin);
      url.searchParams.set("limit", String(isNaN(limit) ? 20 : limit));

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
      }

      const bills = await res.json();
      serverBillsCache = Array.isArray(bills) ? bills : [];

      applyClientFilter();
    } catch (err) {
      console.error(err);
      renderEmpty("Failed to load bills. Check backend endpoint + console.");
      setHint("Error loading bills");
      toast("Error: " + (err?.message || "Unknown error"), "error");
    }
  }

  function applyClientFilter() {
    const q = (els.searchInput?.value || "").trim().toLowerCase();
    const status = (els.statusFilter?.value || "").trim().toLowerCase();
    const utilityType = (els.utilityFilter?.value || "").trim().toLowerCase();
    const customerType = (els.customerTypeFilter?.value || "").trim().toLowerCase();
    const hideFullyPaid = !!els.hideFullyPaid?.checked;

    let filtered = [...serverBillsCache];

    if (hideFullyPaid) {
      filtered = filtered.filter(b => String(pick(b, ["status"]) || "").toLowerCase() !== "fully paid");
    }

    if (status) {
      filtered = filtered.filter(b => String(pick(b, ["status"]) || "").toLowerCase() === status);
    }

    if (utilityType) {
      filtered = filtered.filter(b => String(pick(b, ["utilityType", "utility_type"]) || "").toLowerCase() === utilityType);
    }

    if (customerType) {
      filtered = filtered.filter(b => String(pick(b, ["customerType", "customer_type"]) || "").toLowerCase() === customerType);
    }

    if (q) {
      filtered = filtered.filter(b => {
        const billId = String(pick(b, ["billId", "bill_id"]) ?? "").toLowerCase();
        const name = String(pick(b, ["customerName", "fullName", "name"]) ?? "").toLowerCase();
        const customerId = String(pick(b, ["customerId", "customer_id"]) ?? "").toLowerCase();
        const connectionId = String(pick(b, ["connectionId", "connection_id"]) ?? "").toLowerCase();
        const util = String(pick(b, ["utilityType", "utility_type"]) ?? "").toLowerCase();
        return (
          billId.includes(q) ||
          name.includes(q) ||
          customerId.includes(q) ||
          connectionId.includes(q) ||
          util.includes(q)
        );
      });
    }

    if (filtered.length === 0) {
      renderEmpty("No bills found. Try another search/filter.");
      setHint("0 bills");
      return;
    }

    renderBills(filtered);
    setHint(`${filtered.length} bill(s) shown`);
  }

  function renderBills(bills) {
    els.list.innerHTML = "";

    bills.forEach(b => {
      const billId = pick(b, ["billId", "bill_id"]) ?? "-";
      const customerName = pick(b, ["customerName", "fullName", "name"]) ?? "-";
      const customerId = pick(b, ["customerId", "customer_id"]) ?? "-";
      const connectionId = pick(b, ["connectionId", "connection_id"]) ?? "";
      const utilityType = pick(b, ["utilityType", "utility_type"]) ?? "-";
      const totalBill = pick(b, ["totalBillAmount", "total_bill_amount", "amount"]) ?? 0;
      const outstanding = pick(b, ["outstandingAmount", "outstanding_amount"]) ?? 0;
      const status = String(pick(b, ["status"]) ?? "-");

      const canPay = num(outstanding) > 0;

      const row = document.createElement("div");
      row.className = "bill-row";

      row.innerHTML = `
        <div class="lr-col id">#${esc(billId)}</div>
        <div class="lr-col name">${esc(customerName)}</div>
        <div class="lr-col account">${esc(customerId)}</div>
        <div class="lr-col utility">${esc(utilityType)}</div>
        <div class="lr-col amount">LKR ${esc(money(totalBill))}</div>
        <div class="lr-col status">${statusBadge(status)}</div>
        <div class="lr-col action">
          <button class="btn btn-view-sm" type="button" data-view="1">Full View</button>
          <button class="btn btn-pay" type="button" data-pay="1" ${canPay ? "" : "disabled"}>${canPay ? "Pay" : "Paid"}</button>
        </div>
      `;

      row.querySelector("[data-view]")?.addEventListener("click", () => {
        window.location.href =
          `cashier-billdetail.html?billId=${encodeURIComponent(String(billId))}&connectionId=${encodeURIComponent(String(connectionId))}`;
      });

      row.querySelector("[data-pay]")?.addEventListener("click", () => {
        if (!canPay) return;
        window.location.href =
          `cashier-paybill.html?connectionId=${encodeURIComponent(String(connectionId))}`;
      });

      els.list.appendChild(row);
    });
  }

  function renderLoader() {
    els.list.innerHTML = `
      <div class="empty-state">
        <div class="dot-loader"><span></span><span></span><span></span></div>
        <div style="margin-top:10px;">Loading...</div>
      </div>
    `;
  }

  function renderEmpty(msg) {
    els.list.innerHTML = `<div class="empty-state">${esc(msg)}</div>`;
  }

  function setHint(msg) {
    if (els.hint) els.hint.textContent = msg || "";
  }

  function statusBadge(status) {
    const s = String(status || "").toUpperCase();
    let cls = "status-pill";
    if (s.includes("FULL")) cls += " paid";
    else if (s.includes("PART")) cls += " partial";
    else cls += " pending";
    return `<span class="${cls}">${esc(status)}</span>`;
  }

  function num(v) {
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }

  function money(val) {
    const n = num(val);
    return n.toFixed(2);
  }

  function pick(obj, keys) {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
    }
    return null;
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ""; }
  }

  // FIX: always convert to string so replaceAll won't crash
  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(message, type = "success") {
    if (typeof window.toast === "function") {
      window.toast(message, type);
      return;
    }
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast active " + (type === "error" ? "error" : "success");
    el.textContent = message;
    setTimeout(() => { el.className = "toast"; }, 2500);
  }

  return { init, loadBills };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.CashierBillsDashboard?.init();
});

els.refreshBtn?.addEventListener("click", async () => {
  els.refreshBtn.classList.add("loading");
  await loadBills();
  els.refreshBtn.classList.remove("loading");
});
