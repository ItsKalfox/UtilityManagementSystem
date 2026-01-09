window.CashierBillHistory = (() => {
  const API_BASE = ""; // same origin

  const els = {};
  let debounceTimer = null;
  let billsCache = [];

  function init() {
    els.search = document.getElementById("billHistorySearchInput");
    els.status = document.getElementById("billHistoryStatusFilter");
    els.utility = document.getElementById("billHistoryUtilityFilter");
    els.customerType = document.getElementById("billHistoryCustomerTypeFilter");
    els.limit = document.getElementById("billHistoryLimit");
    els.refresh = document.getElementById("refreshBillHistoryBtn");

    els.list = document.getElementById("billHistoryList");
    els.hint = document.getElementById("billHistoryHint");

    if (!els.list) return;

    wireEvents();
    loadBills();
  }

  function wireEvents() {
    els.search?.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilter, 250);
    });

    els.status?.addEventListener("change", applyFilter);
    els.utility?.addEventListener("change", applyFilter);
    els.customerType?.addEventListener("change", applyFilter);

    els.limit?.addEventListener("change", loadBills);
    els.refresh?.addEventListener("click", loadBills);
  }

  async function loadBills() {
    setHint("Loading bill history...");
    renderLoader();

    const limit = parseInt(els.limit?.value || "200", 10);
    const token = localStorage.getItem("token");

    try {
      const url = new URL(API_BASE + "/api/cashier/bills", window.location.origin);
      url.searchParams.set("limit", String(isNaN(limit) ? 200 : limit));

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${await safeText(res)}`);

      const data = await res.json();
      billsCache = Array.isArray(data) ? data : [];

      applyFilter();
    } catch (e) {
      console.error(e);
      renderEmpty("Failed to load bill history.");
      setHint("Error");
      toast(e.message || "Failed", "error");
    }
  }

  function applyFilter() {
    const q = (els.search?.value || "").trim().toLowerCase();
    const status = (els.status?.value || "").trim().toLowerCase();
    const utility = (els.utility?.value || "").trim().toLowerCase();
    const customerType = (els.customerType?.value || "").trim().toLowerCase();

    // ✅ only paid/partially-paid
    let list = billsCache.filter(b => {
      const s = String(b.status || "").toUpperCase();
      return s === "FULLY PAID" || s === "PARTIALLY PAID";
    });

    if (status) list = list.filter(b => String(b.status || "").toLowerCase() === status);
    if (utility) list = list.filter(b => String(b.utilityType || "").toLowerCase() === utility);
    if (customerType) list = list.filter(b => String(b.customerType || "").toLowerCase() === customerType);

    if (q) {
      list = list.filter(b => {
        const billId = String(b.billId ?? "").toLowerCase();
        const name = String(b.customerName ?? "").toLowerCase();
        const custId = String(b.customerId ?? "").toLowerCase();
        const connId = String(b.connectionId ?? "").toLowerCase();
        const util = String(b.utilityType ?? "").toLowerCase();
        return billId.includes(q) || name.includes(q) || custId.includes(q) || connId.includes(q) || util.includes(q);
      });
    }

    if (!list.length) {
      renderEmpty("No paid bills found.");
      setHint("0 bills");
      return;
    }

    renderBills(list);
    setHint(`${list.length} paid bill(s) shown`);
  }

  function renderBills(list) {
    els.list.innerHTML = "";

    list.forEach(b => {
      const billId = b.billId ?? "-";
      const connectionId = b.connectionId ?? "-";

      const row = document.createElement("div");
      row.className = "billhistory-row";

      row.innerHTML = `
        <div class="cell">#${esc(billId)}</div>
        <div class="cell">${esc(b.customerName ?? "-")}</div>
        <div class="cell">${esc(b.customerId ?? "-")}</div>
        <div class="cell">${esc(b.utilityType ?? "-")}</div>
        <div class="cell">${esc(periodText(b.periodStart, b.periodEnd))}</div>
        <div class="cell">${esc(money(b.totalBillAmount))}</div>
        <div class="cell">${esc(money(b.outstandingAmount))}</div>
        <div class="cell">${statusBadge(String(b.status ?? "-"))}</div>
        <div class="action-cell">
          <button class="btn btn-view-sm" type="button">Full View</button>
        </div>
      `;

      row.querySelector("button")?.addEventListener("click", () => {
        // ✅ Open modal instead of navigating
        if (window.openBillDetailModal) {
          window.openBillDetailModal(String(billId), String(connectionId));
        } else {
          // fallback
          window.location.href =
            `cashier-billdetail.html?billId=${encodeURIComponent(billId)}&connectionId=${encodeURIComponent(connectionId)}`;
        }
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
    const s = status.toUpperCase();
    let cls = "status-pill";
    if (s.includes("FULL")) cls += " paid";
    else if (s.includes("PART")) cls += " partial";
    else cls += " pending";
    return `<span class="${cls}">${esc(status)}</span>`;
  }

  function periodText(start, end) {
    const ps = fmt(start);
    const pe = fmt(end);
    return (ps && pe) ? `${ps} → ${pe}` : "-";
  }

  function fmt(x) {
    if (!x) return "";
    try {
      const d = new Date(x);
      if (isNaN(d.getTime())) return String(x);
      return d.toLocaleDateString();
    } catch {
      return String(x);
    }
  }

  function num(v) {
    const n = typeof v === "number" ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function money(v) {
    const n = num(v);
    return `LKR ${n.toFixed(2)}`;
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ""; }
  }

  function esc(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(message, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast active " + (type === "error" ? "error" : "success");
    el.textContent = message;
    setTimeout(() => { el.className = "toast"; }, 2500);
  }

  return { init, loadBills };
})();
