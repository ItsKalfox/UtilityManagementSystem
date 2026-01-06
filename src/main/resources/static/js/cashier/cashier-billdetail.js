document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = ""; // same origin

  // ===== Bill fields =====
  const billIdText = document.getElementById("billIdText");
  const connectionIdText = document.getElementById("connectionIdText");
  const utilityTypeText = document.getElementById("utilityTypeText");
  const statusText = document.getElementById("statusText");
  const periodText = document.getElementById("periodText");
  const totalText = document.getElementById("totalText");
  const outstandingText = document.getElementById("outstandingText");

  // ===== Customer fields =====
  const customerNameText = document.getElementById("customerNameText");
  const customerTypeText = document.getElementById("customerTypeText");
  const accountText = document.getElementById("accountText");
  const notesText = document.getElementById("notesText");

  // ===== NEW UI elements (polish) =====
  const chipBillId = document.getElementById("chipBillId");
  const chipConnection = document.getElementById("chipConnection");
  const chipUtility = document.getElementById("chipUtility");
  const chipStatus = document.getElementById("chipStatus");
  const statusPill = document.getElementById("statusPill");
  const outstandingHint = document.getElementById("outstandingHint");
  const customerTypeChip = document.getElementById("customerTypeChip");

  const copyBillBtn = document.getElementById("copyBillBtn");
  const copyCustomerBtn = document.getElementById("copyCustomerBtn");

  // ===== Buttons =====
  const backBtn = document.getElementById("backBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const payNowBtn = document.getElementById("payNowBtn");

  // ===== Debug + Toast =====
  const debugJson = document.getElementById("debugJson");
  const toastEl = document.getElementById("toast");

  const billId = getParam("billId");
  const connectionId = getParam("connectionId");

  if (!billId) {
    toast("Missing billId in URL", "error");
    return;
  }

  wireEvents();
  loadBillDetail();

  function wireEvents() {
    backBtn?.addEventListener("click", () => window.history.back());
    reloadBtn?.addEventListener("click", loadBillDetail);

    payNowBtn?.addEventListener("click", () => {
      if (!connectionId) {
        toast("Missing connectionId to open Pay page", "error");
        return;
      }
      window.location.href = `cashier-paybill.html?connectionId=${encodeURIComponent(connectionId)}`;
    });

    copyBillBtn?.addEventListener("click", async () => {
      const txt = `BillID: ${billIdText?.textContent || "-"} | ConnectionID: ${connectionIdText?.textContent || "-"}`;
      await copyToClipboard(txt);
      toast("Copied bill IDs ✅", "success");
    });

    copyCustomerBtn?.addEventListener("click", async () => {
      const txt =
        `Customer: ${customerNameText?.textContent || "-"} | CustomerID: ${accountText?.textContent || "-"} | Type: ${customerTypeText?.textContent || "-"}`;
      await copyToClipboard(txt);
      toast("Copied customer info ✅", "success");
    });
  }

  async function loadBillDetail() {
    try {
      // ✅ easiest: reuse /api/cashier/bills list and find the one bill
      const res = await fetchJson(`/api/cashier/bills?limit=200`);
      const bills = Array.isArray(res) ? res : [];

      const bill = bills.find(x => String(x.billId) === String(billId));
      if (!bill) throw new Error("Bill not found in /api/cashier/bills");

      renderBill(bill);

      if (debugJson) debugJson.textContent = JSON.stringify(bill, null, 2);

      // ✅ Option A: fetch extra customer info (nic/email/phone/etc.)
      if (bill.customerId) {
        await loadCustomerExtras(bill.customerId);
      } else {
        if (notesText) notesText.textContent = "No customerId returned with bill.";
      }
    } catch (e) {
      console.error(e);
      toast(e.message || "Failed to load bill detail", "error");
      if (notesText) notesText.textContent = "Failed to load customer/bill detail.";
    }
  }

  function renderBill(b) {
    // Main bill text
    if (billIdText) billIdText.textContent = b.billId ?? "-";
    if (connectionIdText) connectionIdText.textContent = b.connectionId ?? "-";
    if (utilityTypeText) utilityTypeText.textContent = b.utilityType ?? "-";
    if (statusText) statusText.textContent = b.status ?? "-";

    const ps = formatDateTime(b.periodStart);
    const pe = formatDateTime(b.periodEnd);
    if (periodText) periodText.textContent = (ps && pe) ? `${ps} → ${pe}` : "-";

    if (totalText) totalText.textContent = b.totalBillAmount != null ? money(b.totalBillAmount) : "-";
    if (outstandingText) outstandingText.textContent = b.outstandingAmount != null ? money(b.outstandingAmount) : "-";

    // Customer section (already in bills API ✅)
    if (customerNameText) customerNameText.textContent = b.customerName ?? "-";
    if (customerTypeText) customerTypeText.textContent = b.customerType ?? "-";
    if (accountText) accountText.textContent = b.customerId ?? "-";

    // ===== NEW UI polish =====
    if (chipBillId) chipBillId.textContent = `Bill # ${b.billId ?? "-"}`;
    if (chipConnection) chipConnection.textContent = `Connection # ${b.connectionId ?? "-"}`;
    if (chipUtility) chipUtility.textContent = `Utility: ${b.utilityType ?? "-"}`;

    // status pills
    const status = b.status ?? "-";
    if (chipStatus) {
      chipStatus.textContent = status;
      applyStatusPill(chipStatus, status);
    }
    if (statusPill) {
      statusPill.textContent = status;
      applyStatusPill(statusPill, status);
    }

    // customer type chip
    if (customerTypeChip) customerTypeChip.textContent = b.customerType ?? "-";

    // outstanding hint
    const out = Number(b.outstandingAmount ?? 0);
    if (outstandingHint) {
      if (!isNaN(out) && out <= 0.0001) {
        outstandingHint.textContent = "No outstanding amount.";
      } else {
        outstandingHint.textContent = "Collect payment from customer.";
      }
    }
  }

  async function loadCustomerExtras(customerId) {
    try {
      const url = new URL(API_BASE + "/api/cashier/customers/search", window.location.origin);
      url.searchParams.set("q", String(customerId));
      url.searchParams.set("limit", "1");

      const res = await fetchJson(url.pathname + "?" + url.searchParams.toString());

      if (!Array.isArray(res) || res.length === 0) {
        if (notesText) notesText.textContent = "Customer extra details not found (search returned empty).";
        return;
      }

      const c = res[0];
      const parts = [];
      if (c.nic) parts.push(`NIC: ${c.nic}`);
      if (c.email) parts.push(`Email: ${c.email}`);
      if (c.phone) parts.push(`Phone: ${c.phone}`);
      if (c.addressCity) parts.push(`City: ${c.addressCity}`);
      if (c.areaCode) parts.push(`Area: ${c.areaCode}`);

      if (notesText) notesText.textContent = parts.length ? parts.join(" | ") : "No extra customer fields.";
    } catch (e) {
      console.warn(e);
      if (notesText) notesText.textContent = "Could not load extra customer details (optional).";
    }
  }

  // ===== Helpers =====
  function applyStatusPill(el, status) {
    if (!el) return;

    el.classList.remove("paid", "partial", "pending");

    const s = String(status || "").toUpperCase();
    if (s.includes("FULL")) el.classList.add("paid");
    else if (s.includes("PART")) el.classList.add("partial");
    else el.classList.add("pending");
  }

  async function fetchJson(path) {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + path, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${await safeText(res)}`);
    return res.json();
  }

  function getParam(key) {
    const u = new URL(window.location.href);
    return u.searchParams.get(key);
  }

  function formatDateTime(x) {
    if (!x) return "";
    try {
      const d = new Date(x);
      return isNaN(d.getTime()) ? String(x) : d.toLocaleString();
    } catch {
      return String(x);
    }
  }

  function money(n) {
    const num = typeof n === "number" ? n : parseFloat(n);
    if (isNaN(num)) return "0.00";
    return `LKR ${num.toFixed(2)}`;
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ""; }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  function toast(msg, type = "success") {
    if (!toastEl) return;
    toastEl.className = "toast active " + (type === "error" ? "error" : "success");
    toastEl.textContent = msg;
    setTimeout(() => (toastEl.className = "toast"), 2500);
  }
});
