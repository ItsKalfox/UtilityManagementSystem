window.CashierBillDetailModal = (() => {
  const API_BASE = "";

  function template() {
    return `
  <div class="billdetail-card billdetail-card--modal">
    <div class="billdetail-header">
      <div>
        <h2>Bill Detail</h2>
        <p class="muted" id="pageHint">View bill + customer info and take action.</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" id="backBtn" type="button">
          <img src="../images/back-icon.svg" class="inline-icon" alt="back">
          Back
        </button>

        <button class="btn btn-secondary" id="reloadBtn" type="button">
          <img src="../images/refresh-icon.svg" class="inline-icon" alt="reload">
          Reload
        </button>

        <button class="btn btn-primary" id="payNowBtn" type="button">
          <img src="../images/payment-icon.svg" class="inline-icon" alt="pay">
          Pay Now
        </button>
      </div>
    </div>

    <div class="billdetail-body">

      <div class="top-chips">
        <span class="chip" id="chipBillId">Bill # -</span>
        <span class="chip" id="chipConnection">Connection # -</span>
        <span class="chip" id="chipUtility">Utility: -</span>
        <span class="chip status-pill pending" id="chipStatus">-</span>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Bill Summary</div>
          <div class="panel-actions">
            <button class="btn btn-secondary btn-sm" id="copyBillBtn" type="button">Copy IDs</button>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="label">Bill ID</div>
            <div class="value" id="billIdText">-</div>
          </div>

          <div class="info-item">
            <div class="label">Connection ID</div>
            <div class="value" id="connectionIdText">-</div>
          </div>

          <div class="info-item">
            <div class="label">Utility Type</div>
            <div class="value" id="utilityTypeText">-</div>
          </div>

          <div class="info-item">
            <div class="label">Status</div>
            <div class="value">
              <span class="status-pill pending" id="statusPill">-</span>
            </div>
          </div>

          <div class="info-item wide">
            <div class="label">Period</div>
            <div class="value" id="periodText">-</div>
          </div>

          <div class="info-item highlight money-box">
            <div class="label">Total</div>
            <div class="value money" id="totalText">-</div>
          </div>

          <div class="info-item highlight money-box" id="outstandingBox">
            <div class="label">Outstanding</div>
            <div class="value money" id="outstandingText">-</div>
            <div class="muted tiny" id="outstandingHint"></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Customer</div>
          <div class="panel-actions">
            <button class="btn btn-secondary btn-sm" id="copyCustomerBtn" type="button">Copy Customer</button>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="label">Customer Name</div>
            <div class="value" id="customerNameText">-</div>
          </div>

          <div class="info-item">
            <div class="label">Customer Type</div>
            <div class="value">
              <span class="chip" id="customerTypeChip">-</span>
            </div>
          </div>

          <div class="info-item">
            <div class="label">Account / Customer ID</div>
            <div class="value" id="accountText">-</div>
          </div>

          <div class="info-item wide">
            <div class="label">Notes</div>
            <div class="value muted" id="notesText">-</div>
          </div>
        </div>
      </div>

      <div class="panel full debug-only">
        <div class="panel-title">Debug</div>
        <pre class="json-box" id="debugJson">{}</pre>
      </div>

    </div>
  </div>
  `;
  }

  function init(mountEl, { billId, connectionId }) {
    const $ = (sel) => mountEl.querySelector(sel);

    const billIdText = $("#billIdText");
    const connectionIdText = $("#connectionIdText");
    const utilityTypeText = $("#utilityTypeText");
    const periodText = $("#periodText");
    const totalText = $("#totalText");
    const outstandingText = $("#outstandingText");

    const customerNameText = $("#customerNameText");
    const accountText = $("#accountText");
    const notesText = $("#notesText");

    const chipBillId = $("#chipBillId");
    const chipConnection = $("#chipConnection");
    const chipUtility = $("#chipUtility");
    const chipStatus = $("#chipStatus");
    const statusPill = $("#statusPill");
    const outstandingHint = $("#outstandingHint");
    const customerTypeChip = $("#customerTypeChip");

    const copyBillBtn = $("#copyBillBtn");
    const copyCustomerBtn = $("#copyCustomerBtn");

    const backBtn = $("#backBtn");
    const reloadBtn = $("#reloadBtn");
    const payNowBtn = $("#payNowBtn");

    const debugJson = $("#debugJson");

    function toast(msg, type = "success") {
      const toastEl = document.getElementById("toast");
      if (!toastEl) return;
      toastEl.className = "toast active " + (type === "error" ? "error" : "success");
      toastEl.textContent = msg;
      setTimeout(() => (toastEl.className = "toast"), 2500);
    }

    function getToken() {
      return localStorage.getItem("token") || localStorage.getItem("jwt") || "";
    }

    async function safeText(res) {
      try { return await res.text(); } catch { return ""; }
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
      if (isNaN(num)) return "LKR 0.00";
      return `LKR ${num.toFixed(2)}`;
    }

    function applyStatusPill(el, status) {
      if (!el) return;
      el.classList.remove("paid", "partial", "pending");
      const s = String(status || "").toUpperCase();
      if (s.includes("FULL")) el.classList.add("paid");
      else if (s.includes("PART")) el.classList.add("partial");
      else el.classList.add("pending");
    }

    async function fetchJson(path) {
      const token = getToken();
      const res = await fetch(API_BASE + path, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${await safeText(res)}`);
      return res.json();
    }

    async function loadCustomerExtras(customerId) {
      try {
        const url = new URL(API_BASE + "/api/cashier/customers/search", window.location.origin);
        url.searchParams.set("q", String(customerId));
        url.searchParams.set("limit", "1");

        const res = await fetchJson(url.pathname + "?" + url.searchParams.toString());
        if (!Array.isArray(res) || res.length === 0) {
          if (notesText) notesText.textContent = "Customer extra details not found.";
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
      } catch {
        if (notesText) notesText.textContent = "Could not load extra customer details (optional).";
      }
    }

    function renderBill(b) {
      if (billIdText) billIdText.textContent = b.billId ?? "-";
      if (connectionIdText) connectionIdText.textContent = b.connectionId ?? "-";
      if (utilityTypeText) utilityTypeText.textContent = b.utilityType ?? "-";

      const ps = formatDateTime(b.periodStart);
      const pe = formatDateTime(b.periodEnd);
      if (periodText) periodText.textContent = (ps && pe) ? `${ps} → ${pe}` : "-";

      if (totalText) totalText.textContent = b.totalBillAmount != null ? money(b.totalBillAmount) : "-";
      if (outstandingText) outstandingText.textContent = b.outstandingAmount != null ? money(b.outstandingAmount) : "-";

      if (customerNameText) customerNameText.textContent = b.customerName ?? "-";
      if (accountText) accountText.textContent = b.customerId ?? "-";

      if (chipBillId) chipBillId.textContent = `Bill # ${b.billId ?? "-"}`;
      if (chipConnection) chipConnection.textContent = `Connection # ${b.connectionId ?? "-"}`;
      if (chipUtility) chipUtility.textContent = `Utility: ${b.utilityType ?? "-"}`;

      const status = b.status ?? "-";
      if (chipStatus) {
        chipStatus.textContent = status;
        applyStatusPill(chipStatus, status);
      }
      if (statusPill) {
        statusPill.textContent = status;
        applyStatusPill(statusPill, status);
      }

      if (customerTypeChip) customerTypeChip.textContent = b.customerType ?? "-";

      const out = Number(b.outstandingAmount ?? 0);
      if (outstandingHint) {
        if (!isNaN(out) && out <= 0.0001) outstandingHint.textContent = "No outstanding amount.";
        else outstandingHint.textContent = "Collect payment from customer.";
      }
    }

    async function loadBillDetail() {
      try {
        if (!billId) throw new Error("Missing billId");

        const res = await fetchJson(`/api/cashier/bills?limit=200`);
        const bills = Array.isArray(res) ? res : [];

        const bill = bills.find(x => String(x.billId) === String(billId));
        if (!bill) throw new Error("Bill not found in /api/cashier/bills");

        renderBill(bill);
        if (debugJson) debugJson.textContent = JSON.stringify(bill, null, 2);

        if (bill.customerId) await loadCustomerExtras(bill.customerId);
        else if (notesText) notesText.textContent = "No customerId returned with bill.";
      } catch (e) {
        console.error(e);
        toast(e.message || "Failed to load bill detail", "error");
        if (notesText) notesText.textContent = "Failed to load customer/bill detail.";
      }
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

    const onClose = () => window.closePageModal?.();
    const onReload = () => loadBillDetail();
    const onPayNow = () => {
      const cid = connectionId || connectionIdText?.textContent;
      if (!cid) {
        toast("Missing connectionId to open Pay page", "error");
        return;
      }
      window.openPayBillModal?.(String(cid));
    };

    backBtn?.addEventListener("click", onClose);
    reloadBtn?.addEventListener("click", onReload);
    payNowBtn?.addEventListener("click", onPayNow);

    copyBillBtn?.addEventListener("click", async () => {
      const txt = `BillID: ${billIdText?.textContent || "-"} | ConnectionID: ${connectionIdText?.textContent || "-"}`;
      await copyToClipboard(txt);
      toast("Copied bill IDs ", "success");
    });

    copyCustomerBtn?.addEventListener("click", async () => {
      const txt = `Customer: ${customerNameText?.textContent || "-"} | CustomerID: ${accountText?.textContent || "-"}`;
      await copyToClipboard(txt);
      toast("Copied customer info ", "success");
    });

    loadBillDetail();

    return function cleanup() {
      backBtn?.removeEventListener("click", onClose);
      reloadBtn?.removeEventListener("click", onReload);
      payNowBtn?.removeEventListener("click", onPayNow);
    };
  }

  return { template, init };
})();
