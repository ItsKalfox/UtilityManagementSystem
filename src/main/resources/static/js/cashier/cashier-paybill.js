window.CashierPayBillModal = (() => {
  const API_BASE = "";

  function template() {
 
    return `
  <div class="paybill-card paybill-card--modal">
    <div class="paybill-header">
      <div>
        <h2>Pay Bill</h2>
        <p class="muted" id="pageHint">Load bill details and complete payment.</p>
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
      </div>
    </div>

    <div class="bill-summary" id="billSummary">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="label">Connection ID</div>
          <div class="value" id="connectionIdText">-</div>
        </div>

        <div class="summary-item">
          <div class="label">Bill ID</div>
          <div class="value" id="billIdText">-</div>
        </div>

        <div class="summary-item">
          <div class="label">Period</div>
          <div class="value" id="periodText">-</div>
        </div>

        <div class="summary-item">
          <div class="label">Status</div>
          <div class="value" id="statusText">-</div>
        </div>

        <div class="summary-item highlight">
          <div class="label">Total</div>
          <div class="value" id="totalText">-</div>
        </div>

        <div class="summary-item highlight">
          <div class="label">Outstanding</div>
          <div class="value" id="outstandingText">-</div>
        </div>
      </div>
    </div>

    <div class="pay-form">
      <div class="form-row">
        <div class="form-group">
          <label for="amountInput">Pay Amount (LKR)</label>
          <input id="amountInput" type="number" step="0.01" min="0" placeholder="e.g. 200.00" />
          <div class="help muted">Tip: You can pay partially or fully.</div>
        </div>

        <div class="form-group">
          <label for="methodSelect">Payment Method</label>
          <select id="methodSelect">
            <option value="">Select method</option>
            <option value="CASH">CASH</option>
            <option value="CARD">CARD</option>
            <option value="BANK TRANSFER">BANK TRANSFER</option>
          </select>
        </div>
      </div>

      <div class="method-box" id="cashBox" style="display:none;">
        <h3>Cash Payment</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="amountGivenInput">Amount Given (LKR)</label>
            <input id="amountGivenInput" type="number" step="0.01" min="0" placeholder="e.g. 1000.00" />
          </div>

          <div class="form-group">
            <label>Calculated Balance (Change)</label>
            <input id="balanceOutput" type="text" readonly placeholder="0.00" />
          </div>
        </div>
      </div>

      <div class="method-box" id="cardBox" style="display:none;">
        <div class="row-between">
          <h3>Card Payment</h3>
          <button type="button" class="btn btn-secondary" id="simulateSwipeBtn">
            <img src="../images/simulate-icon.svg" class="inline-icon" alt="card">
            Simulate Card Swipe
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="cardPlatformName">Platform Name</label>
            <input id="cardPlatformName" type="text" placeholder="VISA / MASTERCARD / AMEX" />
          </div>

          <div class="form-group">
            <label for="cardType">Card Type</label>
            <select id="cardType">
              <option value="">Select</option>
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="approvalCode">Approval Code</label>
            <input id="approvalCode" type="text" placeholder="AP-123456" />
          </div>

          <div class="form-group">
            <label for="maskedCardNo">Masked Card Number (demo)</label>
            <input id="maskedCardNo" type="text" readonly />
          </div>
        </div>
      </div>

      <div class="method-box" id="bankBox" style="display:none;">
        <div class="row-between">
          <h3>Bank Transfer</h3>
          <button type="button" class="btn btn-secondary" id="simulateBankBtn">
            <img src="../images/simulate-icon.svg" class="inline-icon" alt="bank">
            Simulate Bank Transfer
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bankName">Bank Name</label>
            <input id="bankName" type="text" placeholder="e.g. BOC / HNB / Peoples Bank" />
          </div>

          <div class="form-group">
            <label for="bankAccountNo">Account Number</label>
            <input id="bankAccountNo" type="text" placeholder="e.g. 1234567890" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="txnNumber">Transaction Number</label>
            <input id="txnNumber" type="text" placeholder="e.g. TRX-998877" />
          </div>

          <div class="form-group">
            <label class="muted">Note</label>
            <div class="help muted">Use the receipt / transcript details from the customer.</div>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <button class="btn btn-secondary" id="fillOutstandingBtn" type="button">
          Pay Full Outstanding
        </button>

        <button class="btn btn-primary" id="payBtn" type="button">
          <img src="../images/pay-icon.svg" class="inline-icon" alt="pay">
          Pay Now
        </button>
      </div>

      <div class="muted small" id="debugInfo"></div>
    </div>
  </div>
`;
  }

  function init(mountEl, { connectionId }) {
    const $ = (sel) => mountEl.querySelector(sel);

    const pageHint = $("#pageHint");
    const connectionIdText = $("#connectionIdText");
    const billIdText = $("#billIdText");
    const periodText = $("#periodText");
    const statusText = $("#statusText");
    const totalText = $("#totalText");
    const outstandingText = $("#outstandingText");

    const backBtn = $("#backBtn");
    const reloadBtn = $("#reloadBtn");

    const amountInput = $("#amountInput");
    const methodSelect = $("#methodSelect");

    const cashBox = $("#cashBox");
    const cardBox = $("#cardBox");
    const bankBox = $("#bankBox");

    const amountGivenInput = $("#amountGivenInput");
    const balanceOutput = $("#balanceOutput");

    const simulateSwipeBtn = $("#simulateSwipeBtn");
    const cardPlatformName = $("#cardPlatformName");
    const cardType = $("#cardType");
    const approvalCode = $("#approvalCode");
    const maskedCardNo = $("#maskedCardNo");

    const simulateBankBtn = $("#simulateBankBtn");
    const bankName = $("#bankName");
    const bankAccountNo = $("#bankAccountNo");
    const txnNumber = $("#txnNumber");

    const fillOutstandingBtn = $("#fillOutstandingBtn");
    const payBtn = $("#payBtn");

    const debugInfo = $("#debugInfo");

    let currentBill = null;

    function toast(message, type = "success") {
      const el = document.getElementById("toast");
      if (!el) return;
      el.className = "toast active " + (type === "error" ? "error" : "success");
      el.textContent = message;
      setTimeout(() => (el.className = "toast"), 2500);
    }

    function setBusy(isBusy) {
      if (payBtn) payBtn.disabled = isBusy;
      if (reloadBtn) reloadBtn.disabled = isBusy;
      if (fillOutstandingBtn) fillOutstandingBtn.disabled = isBusy;
    }

    function debug(msg) {
      if (debugInfo) debugInfo.textContent = msg || "";
    }

    function getToken() {
      return localStorage.getItem("token") || localStorage.getItem("jwt") || "";
    }

    function toNum(v) {
      const n = parseFloat(v);
      return Number.isNaN(n) ? null : n;
    }

    function money(val) {
      const n = typeof val === "number" ? val : parseFloat(val);
      if (Number.isNaN(n)) return "0.00";
      return n.toFixed(2);
    }

    function formatDateTime(x) {
      if (!x) return "";
      try {
        const d = new Date(x);
        if (Number.isNaN(d.getTime())) return String(x);
        return d.toLocaleString();
      } catch {
        return String(x);
      }
    }

    async function safeText(res) {
      try { return await res.text(); } catch { return ""; }
    }

    function updateMethodUI() {
      const m = (methodSelect?.value || "").trim().toUpperCase();
      if (cashBox) cashBox.style.display = (m === "CASH") ? "block" : "none";
      if (cardBox) cardBox.style.display = (m === "CARD") ? "block" : "none";
      if (bankBox) bankBox.style.display = (m === "BANK TRANSFER") ? "block" : "none";
    }

    function clearMethodFields() {
      if (amountGivenInput) amountGivenInput.value = "";
      if (balanceOutput) balanceOutput.value = "0.00";

      if (cardPlatformName) cardPlatformName.value = "";
      if (cardType) cardType.value = "";
      if (approvalCode) approvalCode.value = "";
      if (maskedCardNo) maskedCardNo.value = "";

      if (bankName) bankName.value = "";
      if (bankAccountNo) bankAccountNo.value = "";
      if (txnNumber) txnNumber.value = "";
    }

    function updateCashBalance() {
      const m = (methodSelect?.value || "").trim().toUpperCase();
      if (m !== "CASH") {
        if (balanceOutput) balanceOutput.value = "0.00";
        return;
      }
      const payAmount = toNum(amountInput?.value);
      const given = toNum(amountGivenInput?.value);
      if (!payAmount || !given) {
        if (balanceOutput) balanceOutput.value = "0.00";
        return;
      }
      const change = given - payAmount;
      if (balanceOutput) balanceOutput.value = money(change);
    }

  
    function normalizeBill(b) {
      return {
        billId: b.billId ?? b.bill_id ?? null,
        connectionId: b.connectionId ?? b.connection_id ?? connectionId,
        customerId: b.customerId ?? b.customer_id ?? null, 
        utilityType: b.utilityType ?? b.utility_type ?? null,
        customerName: b.customerName ?? b.customer_name ?? "-",
        periodStart: b.periodStart ?? b.period_start ?? null,
        periodEnd: b.periodEnd ?? b.period_end ?? null,
        totalBillAmount: b.totalBillAmount ?? b.total_bill_amount ?? null,
        outstandingAmount: b.outstandingAmount ?? b.outstanding_amount ?? null,
        status: b.status ?? "-",
      };
    }

    function renderBill(b) {
      if (connectionIdText) connectionIdText.textContent = b.connectionId != null ? String(b.connectionId) : "-";
      if (billIdText) billIdText.textContent = b.billId != null ? String(b.billId) : "-";

      const ps = formatDateTime(b.periodStart);
      const pe = formatDateTime(b.periodEnd);
      if (periodText) periodText.textContent = (ps && pe) ? `${ps} → ${pe}` : "-";

      if (statusText) statusText.textContent = b.status ?? "-";
      if (totalText) totalText.textContent = b.totalBillAmount != null ? `LKR ${money(b.totalBillAmount)}` : "-";
      if (outstandingText) outstandingText.textContent = b.outstandingAmount != null ? `LKR ${money(b.outstandingAmount)}` : "-";
    }

    function setBillEmpty() {
      if (connectionIdText) connectionIdText.textContent = "-";
      if (billIdText) billIdText.textContent = "-";
      if (periodText) periodText.textContent = "-";
      if (statusText) statusText.textContent = "-";
      if (totalText) totalText.textContent = "-";
      if (outstandingText) outstandingText.textContent = "-";
    }

    async function loadCurrentBill() {
      if (!connectionId) return;

      setBusy(true);
      debug("Loading bill...");

      try {
        const url = new URL(
          API_BASE + `/api/cashier/connections/${encodeURIComponent(connectionId)}/current-bill`,
          window.location.origin
        );

        const token = getToken();
        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const txt = await safeText(res);
          throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
        }

        const bill = await res.json();
        currentBill = normalizeBill(bill);

        renderBill(currentBill);

        if (currentBill.outstandingAmount != null) {
          amountInput.value = Number(currentBill.outstandingAmount).toFixed(2);
        } else {
          amountInput.value = "";
        }

        updateCashBalance();
        if (pageHint) pageHint.textContent = "Bill loaded. Select a method and pay.";
        toast("Bill loaded ", "success");
        debug("Ready.");
      } catch (err) {
        console.error(err);
        toast(err.message || "Failed to load bill", "error");
        if (pageHint) pageHint.textContent = "Failed to load bill. Check connectionId + backend.";
        setBillEmpty();
        debug("Error loading bill.");
      } finally {
        setBusy(false);
      }
    }

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function simulateCardSwipe() {
      const platforms = ["VISA", "MASTERCARD", "AMEX"];
      const platform = platforms[randInt(0, platforms.length - 1)];

      if (cardPlatformName) cardPlatformName.value = platform;
      if (cardType) cardType.value = Math.random() > 0.5 ? "CREDIT" : "DEBIT";
      if (approvalCode) approvalCode.value = `AP-${randInt(100000, 999999)}`;

      const last4 = randInt(1000, 9999);
      if (maskedCardNo) maskedCardNo.value = `**** **** **** ${last4}`;

      toast("Simulated card swipe ", "success");
    }

    function simulateBankTransfer() {
      const banks = ["BOC", "People's Bank", "HNB", "Commercial Bank", "Sampath", "NDB"];
      const bank = banks[randInt(0, banks.length - 1)];

      if (bankName) bankName.value = bank;
      if (bankAccountNo) bankAccountNo.value = String(randInt(1000000000, 9999999999));
      if (txnNumber) txnNumber.value = `TRX-${randInt(100000, 999999)}-${randInt(10, 99)}`;

      toast("Simulated bank transfer ", "success");
    }


    function buildReceipt({ billBefore, billAfter, payAmount, method, methodDetails }) {
      const now = new Date();

      const beforeOut = Number(billBefore?.outstandingAmount ?? 0);

      const afterOut =
        billAfter?.outstandingAmount != null
          ? Number(billAfter.outstandingAmount)            
          : Math.max(0, beforeOut - Number(payAmount || 0));  

      return {
        receiptNo: `RCPT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${now.getTime()}`,
        dateTime: now.toISOString(),

        billId: billBefore?.billId ?? "-",
        connectionId: billBefore?.connectionId ?? connectionId ?? "-",
        customerId: billBefore?.customerId ?? billAfter?.customerId ?? "-", 
        utilityType: billBefore?.utilityType ?? "-",
        customerName: billBefore?.customerName ?? "-",
        periodStart: billBefore?.periodStart ?? null,
        periodEnd: billBefore?.periodEnd ?? null,

        status: billAfter?.status ?? billBefore?.status ?? "-", 

        outstandingBefore: beforeOut,
        amountPaid: Number(payAmount || 0),
        method,
        methodDetails: methodDetails || {},

        outstandingAfter: afterOut,
      };
    }

    async function submitPayment() {
      if (!currentBill?.billId) {
        toast("No bill loaded.", "error");
        return;
      }

      const method = (methodSelect?.value || "").trim().toUpperCase();
      if (!method) {
        toast("Select a payment method.", "error");
        return;
      }

      const payAmount = toNum(amountInput?.value);
      if (!payAmount || payAmount <= 0) {
        toast("Enter a valid pay amount.", "error");
        return;
      }

      const payload = {
        billId: Number(currentBill.billId),
        amount: payAmount,
        method: method,
      };

      let methodDetails = {};

      if (method === "CASH") {
        const given = toNum(amountGivenInput?.value);
        if (!given || given <= 0) {
          toast("Cash: amount given is required.", "error");
          return;
        }
        payload.cash = { amountGiven: given };
        methodDetails = { amountGiven: given, change: Number((given - payAmount).toFixed(2)) };
      }

      if (method === "CARD") {
        const platform = (cardPlatformName?.value || "").trim();
        const type = (cardType?.value || "").trim().toUpperCase();
        const code = (approvalCode?.value || "").trim();

        if (!platform || !type || !code) {
          toast("Card: use Simulate Card Swipe or fill details.", "error");
          return;
        }

        payload.card = { platformName: platform, cardType: type, approvalCode: code };
        methodDetails = { platformName: platform, cardType: type, approvalCode: code, maskedCardNo: maskedCardNo?.value || "" };
      }

      if (method === "BANK TRANSFER") {
        const bName = (bankName?.value || "").trim();
        const accNo = (bankAccountNo?.value || "").trim();
        const txnNo = (txnNumber?.value || "").trim();

        if (!bName || !accNo || !txnNo) {
          toast("Bank Transfer: simulate or fill details.", "error");
          return;
        }

        payload.bankTransfer = { bankName: bName, accountNumber: accNo, transactionNum: txnNo };
        methodDetails = { bankName: bName, accountNumber: accNo, transactionNum: txnNo };
      }

      const billBefore = { ...currentBill };

      setBusy(true);
      debug("Processing payment...");

      try {
        const url = new URL(API_BASE + "/api/cashier/payments", window.location.origin);
        const token = getToken();

        const res = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await safeText(res);
          throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
        }

        toast("Payment successful ✅", "success");

    
        await loadCurrentBill();

  
        window.CashierBillsDashboard?.loadBills?.();

        const billAfter = { ...currentBill };

    
        const receipt = buildReceipt({
          billBefore,
          billAfter,
          payAmount,
          method,
          methodDetails
        });


        window.openReceiptModal?.(receipt);

      } catch (err) {
        console.error(err);
        toast(err.message || "Payment failed", "error");
        debug("Payment failed. Check backend logs.");
      } finally {
        setBusy(false);
      }
    }

    const onBack = () => window.closePageModal?.();
    const onReload = () => loadCurrentBill();
    const onMethod = () => { updateMethodUI(); clearMethodFields(); updateCashBalance(); };
    const onAmount = () => updateCashBalance();
    const onFill = () => {
      if (currentBill?.outstandingAmount != null) {
        amountInput.value = Number(currentBill.outstandingAmount).toFixed(2);
        updateCashBalance();
      }
    };

    backBtn?.addEventListener("click", onBack);
    reloadBtn?.addEventListener("click", onReload);
    methodSelect?.addEventListener("change", onMethod);
    amountInput?.addEventListener("input", onAmount);
    amountGivenInput?.addEventListener("input", onAmount);
    fillOutstandingBtn?.addEventListener("click", onFill);
    simulateSwipeBtn?.addEventListener("click", simulateCardSwipe);
    simulateBankBtn?.addEventListener("click", simulateBankTransfer);
    payBtn?.addEventListener("click", submitPayment);

    if (!connectionId) {
      if (pageHint) pageHint.textContent = "Missing connectionId.";
      setBillEmpty();
      toast("Missing connectionId", "error");
    } else {
      if (connectionIdText) connectionIdText.textContent = String(connectionId);
      loadCurrentBill();
    }

    updateMethodUI();
    updateCashBalance();

    return function cleanup() {
      backBtn?.removeEventListener("click", onBack);
      reloadBtn?.removeEventListener("click", onReload);
      methodSelect?.removeEventListener("change", onMethod);
      amountInput?.removeEventListener("input", onAmount);
      amountGivenInput?.removeEventListener("input", onAmount);
      fillOutstandingBtn?.removeEventListener("click", onFill);
      simulateSwipeBtn?.removeEventListener("click", simulateCardSwipe);
      simulateBankBtn?.removeEventListener("click", simulateBankTransfer);
      payBtn?.removeEventListener("click", submitPayment);
      currentBill = null;
    };
  }

  return { template, init };
})();
