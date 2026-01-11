window.CashierReceiptModal = (() => {
  function template() {
    return `
  <div class="receipt-card receipt-accent">
    <div class="receipt-header">
      <div>
        <h2>Payment Receipt</h2>
        <p class="muted" id="rcptSub">Receipt generated for this transaction.</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" id="closeBtn" type="button">
          <img src="../images/close-icon.svg" class="inline-icon" alt="close">
          Close
        </button>

        <button class="btn btn-primary" id="printBtn" type="button">
          <img src="../images/print-icon.svg" class="inline-icon" alt="print">
          Print
        </button>
      </div>
    </div>

    <div class="receipt-body">
      <div class="receipt-top">
        <div class="chip chip-accent" id="receiptNoChip">Receipt # -</div>
        <div class="chip" id="receiptDateChip">Date: -</div>
        <div class="chip" id="receiptMethodChip">Method: -</div>
      </div>

      <div class="receipt-grid">
        <div class="receipt-box">
          <div class="box-title">Bill</div>
          <div class="kv"><span>Bill ID</span><b id="billIdText">-</b></div>
          <div class="kv"><span>Connection</span><b id="connIdText">-</b></div>
          <div class="kv"><span>Utility</span><b id="utilText">-</b></div>
          <div class="kv"><span>Period</span><b id="periodText">-</b></div>
        </div>

        <div class="receipt-box">
          <div class="box-title">Customer</div>
          <div class="kv"><span>Customer ID</span><b id="custIdText">-</b></div>
          <div class="kv"><span>Name</span><b id="custNameText">-</b></div>
        </div>

        <div class="receipt-box">
          <div class="box-title">Payment</div>
          <div class="kv"><span>Outstanding (Before)</span><b id="outBeforeText">-</b></div>
          <div class="kv"><span>Amount Paid</span><b id="paidText">-</b></div>
          <div class="kv"><span>Outstanding (After)</span><b id="outAfterText">-</b></div>
          <div class="kv"><span>Status</span><b id="statusText" class="status-pill">-</b></div>
        </div>

        <div class="receipt-box" id="methodBox" style="display:none;">
          <div class="box-title">Method Details</div>
          <div id="methodDetails"></div>
        </div>
      </div>

      <div class="receipt-footer">
        <div class="muted small">Thank you for your payment.</div>
        <div class="muted small">Utility Management System • Cashier Terminal</div>
      </div>
    </div>
  </div>
`;
  }

  function init(mountEl, { receipt }) {
    const $ = (sel) => mountEl.querySelector(sel);

    const closeBtn = $("#closeBtn");
    const printBtn = $("#printBtn");

    const receiptNoChip = $("#receiptNoChip");
    const receiptDateChip = $("#receiptDateChip");
    const receiptMethodChip = $("#receiptMethodChip");

    const billIdText = $("#billIdText");
    const connIdText = $("#connIdText");
    const utilText = $("#utilText");
    const periodText = $("#periodText");

    const custIdText = $("#custIdText");
    const custNameText = $("#custNameText");

    const outBeforeText = $("#outBeforeText");
    const paidText = $("#paidText");
    const outAfterText = $("#outAfterText");
    const statusText = $("#statusText");

    const methodBox = $("#methodBox");
    const methodDetails = $("#methodDetails");

    function money(v) {
      const n = typeof v === "number" ? v : parseFloat(v);
      if (Number.isNaN(n)) return "LKR 0.00";
      return `LKR ${n.toFixed(2)}`;
    }

    function fmtDate(x) {
      if (!x) return "-";
      try {
        const d = new Date(x);
        if (isNaN(d.getTime())) return String(x);
        return d.toLocaleString();
      } catch {
        return String(x);
      }
    }

    function esc(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function getReceiptNumber(r, p) {
      return (
        p?.paymentId ??
        r?.paymentId ??
        r?.receiptNo ??
        r?.receiptNumber ??
        r?.receiptId ??
        r?.transactionNo ??
        r?.transactionId ??
        "-"
      );
    }

    function normalizeReceipt(input) {
      const r = input || {};
      const bill = r.bill || r.currentBill || r.billInfo || r;
      const payment = r.payment || r.paymentInfo || r;
      return { bill, payment, raw: r };
    }

    function setStatusPill(el, status) {
      if (!el) return;
      const s = String(status || "-").toUpperCase();
      el.textContent = status ?? "-";
      el.classList.remove("paid", "partial", "pending");

      if (s.includes("FULLY")) el.classList.add("paid");
      else if (s.includes("PART")) el.classList.add("partial");
      else el.classList.add("pending");
    }

    function render() {
      const { bill, payment, raw } = normalizeReceipt(receipt);

      const receiptNo = getReceiptNumber(raw, payment);
      if (receiptNoChip) receiptNoChip.textContent = `Receipt # ${receiptNo}`;

      const dt = payment?.dateTime || payment?.createdAt || payment?.paidAt || raw?.dateTime || raw?.createdAt || raw?.paidAt || new Date().toISOString();
      if (receiptDateChip) receiptDateChip.textContent = `Date: ${fmtDate(dt)}`;

      const method = payment?.method || payment?.paymentMethod || raw?.method || raw?.paymentMethod || "-";
      if (receiptMethodChip) receiptMethodChip.textContent = `Method: ${method}`;

      if (billIdText) billIdText.textContent = bill?.billId ?? raw?.billId ?? "-";
      if (connIdText) connIdText.textContent = bill?.connectionId ?? raw?.connectionId ?? "-";
      if (utilText) utilText.textContent = bill?.utilityType ?? raw?.utilityType ?? "-";

      const ps = fmtDate(bill?.periodStart ?? raw?.periodStart);
      const pe = fmtDate(bill?.periodEnd ?? raw?.periodEnd);
      if (periodText) periodText.textContent = (ps !== "-" && pe !== "-") ? `${ps} → ${pe}` : "-";

      if (custIdText) custIdText.textContent = bill?.customerId ?? raw?.customerId ?? "-";
      if (custNameText) custNameText.textContent = bill?.customerName ?? raw?.customerName ?? "-";

      const before = bill?.outstandingAmount ?? raw?.outstandingAmount ?? raw?.outstandingBefore ?? raw?.outstandingAmountBefore;
      const paid = payment?.paidAmount ?? payment?.amountPaid ?? raw?.paidAmount ?? raw?.amountPaid;
      const after = payment?.outstandingAmountAfter ?? raw?.outstandingAmountAfter ?? raw?.outstandingAfter;

      if (outBeforeText) outBeforeText.textContent = money(before);
      if (paidText) paidText.textContent = money(paid);
      if (outAfterText) outAfterText.textContent = money(after);

      const st = payment?.billStatusAfter ?? raw?.billStatusAfter ?? bill?.status ?? raw?.status;
      setStatusPill(statusText, st);

      const d = payment?.methodDetails || payment?.details || raw?.methodDetails || raw?.details || {};
      const lines = [];
      const methodUpper = String(method).toUpperCase();

      if (methodUpper === "CASH") {
        if (d.amountGiven != null) lines.push(`<div class="kv"><span>Amount Given</span><b>${money(d.amountGiven)}</b></div>`);
        if (d.change != null) lines.push(`<div class="kv"><span>Change</span><b>${money(d.change)}</b></div>`);
      } else if (methodUpper === "CARD") {
        if (d.platformName) lines.push(`<div class="kv"><span>Platform</span><b>${esc(d.platformName)}</b></div>`);
        if (d.cardType) lines.push(`<div class="kv"><span>Type</span><b>${esc(d.cardType)}</b></div>`);
        if (d.approvalCode) lines.push(`<div class="kv"><span>Approval</span><b>${esc(d.approvalCode)}</b></div>`);
        if (d.maskedCardNo) lines.push(`<div class="kv"><span>Card</span><b>${esc(d.maskedCardNo)}</b></div>`);
      } else if (methodUpper === "BANK TRANSFER" || methodUpper === "BANK_TRANSFER") {
        if (d.bankName) lines.push(`<div class="kv"><span>Bank</span><b>${esc(d.bankName)}</b></div>`);
        if (d.accountNumber) lines.push(`<div class="kv"><span>Account</span><b>${esc(d.accountNumber)}</b></div>`);
        if (d.transactionNum) lines.push(`<div class="kv"><span>Txn No</span><b>${esc(d.transactionNum)}</b></div>`);
      }

      if (lines.length) {
        if (methodDetails) methodDetails.innerHTML = lines.join("");
        if (methodBox) methodBox.style.display = "block";
      } else {
        if (methodBox) methodBox.style.display = "none";
      }
    }

    function openPrintWindow() {
      const receiptHtml = mountEl.querySelector(".receipt-card")?.outerHTML || "<div>Receipt</div>";
      const w = window.open("", "_blank", "width=900,height=700");
      if (!w) return;

      w.document.open();
      w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt</title>
  <style>
    :root{
      --primary-blue:#1E3A8A;
      --secondary-blue:#2563EB;
      --text:#0f172a;
      --muted:#64748b;
      --border:#e2e8f0;
      --bg:#ffffff;
    }
    body{ font-family: Arial, sans-serif; padding: 18px; color:var(--text); background:var(--bg); }
    .receipt-card{ border:1px solid var(--border); border-radius:14px; overflow:hidden; }
    .receipt-accent{ border-top: 6px solid var(--secondary-blue); }
    .receipt-header{
      padding:16px 18px;
      background: linear-gradient(135deg, var(--secondary-blue), var(--primary-blue));
      color:#fff;
      display:flex; justify-content:space-between; gap:12px; align-items:flex-start;
    }
    .receipt-header h2{ margin:0; font-size:20px; }
    .receipt-header .muted{ color: rgba(255,255,255,0.85); margin:6px 0 0; }
    .receipt-body{ padding: 16px 18px; }
    .receipt-top{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
    .chip{ display:inline-flex; padding:8px 12px; border-radius:999px; border:1px solid var(--border); font-weight:700; }
    .chip-accent{ background: rgba(37,99,235,0.10); border-color: rgba(37,99,235,0.25); }
    .receipt-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .receipt-box{ border:1px solid var(--border); border-radius:12px; padding:12px; }
    .box-title{ font-weight:800; margin-bottom:10px; color:var(--primary-blue); }
    .kv{ display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-bottom:1px dashed #e5e7eb; }
    .kv:last-child{ border-bottom:none; }
    .kv span{ color:var(--muted); }
    .receipt-footer{ margin-top:14px; padding-top:12px; border-top:1px solid var(--border); display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; }
    .small{ font-size:12px; }
    .muted{ color:var(--muted); }
    .btn, button, .header-actions { display:none !important; }

    .status-pill{ padding:4px 10px; border-radius:999px; font-weight:800; border:1px solid #e5e7eb; }
    .status-pill.paid{ background:#d1fae5; color:#065f46; border-color:#a7f3d0; }
    .status-pill.partial{ background:#fffbeb; color:#92400e; border-color:#fde68a; }
    .status-pill.pending{ background:#fee2e2; color:#991b1b; border-color:#fecaca; }

    @media print {
      body{ padding:0; }
      .receipt-card{ border-radius:0; }
    }
  </style>
</head>
<body>
  ${receiptHtml}
  <script>
    window.onload = () => { window.print(); setTimeout(() => window.close(), 200); };
  </script>
</body>
</html>
`);
      w.document.close();
    }

    const onClose = () => window.closePageModal?.();
    const onPrint = () => openPrintWindow();

    closeBtn?.addEventListener("click", onClose);
    printBtn?.addEventListener("click", onPrint);

    render();

    return function cleanup() {
      closeBtn?.removeEventListener("click", onClose);
      printBtn?.removeEventListener("click", onPrint);
    };
  }

  return { template, init };
})();