document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = ""; // same-origin

  // ====== ELEMENTS (MATCH YOUR HTML IDs) ======
  const pageHint = document.getElementById("pageHint");

  const connectionIdText = document.getElementById("connectionIdText");
  const billIdText = document.getElementById("billIdText");
  const periodText = document.getElementById("periodText");
  const statusText = document.getElementById("statusText");
  const totalText = document.getElementById("totalText");
  const outstandingText = document.getElementById("outstandingText");

  const backBtn = document.getElementById("backBtn");
  const reloadBtn = document.getElementById("reloadBtn");

  const amountInput = document.getElementById("amountInput");
  const methodSelect = document.getElementById("methodSelect");

  const cashBox = document.getElementById("cashBox");
  const cardBox = document.getElementById("cardBox");
  const bankBox = document.getElementById("bankBox");

  // cash
  const amountGivenInput = document.getElementById("amountGivenInput");
  const balanceOutput = document.getElementById("balanceOutput");

  // card
  const simulateSwipeBtn = document.getElementById("simulateSwipeBtn");
  const cardPlatformName = document.getElementById("cardPlatformName");
  const cardType = document.getElementById("cardType");
  const approvalCode = document.getElementById("approvalCode");
  const maskedCardNo = document.getElementById("maskedCardNo");

  // bank
  const simulateBankBtn = document.getElementById("simulateBankBtn");
  const bankName = document.getElementById("bankName");
  const bankAccountNo = document.getElementById("bankAccountNo");
  const txnNumber = document.getElementById("txnNumber");

  // actions
  const fillOutstandingBtn = document.getElementById("fillOutstandingBtn");
  const payBtn = document.getElementById("payBtn");

  const debugInfo = document.getElementById("debugInfo");

  // ====== STATE ======
  let connectionId = null;
  let currentBill = null;

  init();

  function init() {
    connectionId = getConnectionId();

    if (!connectionId) {
      pageHint.textContent = "Missing connectionId. Open: paybill.html?connectionId=1";
      setBillEmpty();
      toast("Missing connectionId in URL", "error");
    } else {
      connectionIdText.textContent = String(connectionId);
      loadCurrentBill();
    }

    wireEvents();
    updateMethodUI();
    updateCashBalance();
  }

  function wireEvents() {
    backBtn?.addEventListener("click", () => window.history.back());
    reloadBtn?.addEventListener("click", loadCurrentBill);

    methodSelect?.addEventListener("change", () => {
      updateMethodUI();
      clearMethodFields();
    });

    amountInput?.addEventListener("input", () => {
      updateCashBalance();
    });

    amountGivenInput?.addEventListener("input", updateCashBalance);

    fillOutstandingBtn?.addEventListener("click", () => {
      if (currentBill?.outstandingAmount != null) {
        amountInput.value = Number(currentBill.outstandingAmount).toFixed(2);
        updateCashBalance();
      }
    });

    simulateSwipeBtn?.addEventListener("click", simulateCardSwipe);
    simulateBankBtn?.addEventListener("click", simulateBankTransfer);

    payBtn?.addEventListener("click", submitPayment);
  }

  // ====== API: Load Current Bill ======
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

      // Auto-fill amount with outstanding (nice for cashier)
      if (currentBill.outstandingAmount != null) {
        amountInput.value = Number(currentBill.outstandingAmount).toFixed(2);
      } else {
        amountInput.value = "";
      }

      updateCashBalance();
      pageHint.textContent = "Bill loaded. Select a method and pay.";
      toast("Bill loaded ✅", "success");
      debug("Ready.");
    } catch (err) {
      console.error(err);
      toast(err.message || "Failed to load bill", "error");
      pageHint.textContent = "Failed to load bill. Check connectionId + backend.";
      setBillEmpty();
      debug("Error loading bill.");
    } finally {
      setBusy(false);
    }
  }

  function normalizeBill(b) {
    return {
      billId: b.billId ?? b.bill_id ?? null,
      connectionId: b.connectionId ?? b.connection_id ?? connectionId,
      periodStart: b.periodStart ?? b.period_start ?? null,
      periodEnd: b.periodEnd ?? b.period_end ?? null,
      totalBillAmount: b.totalBillAmount ?? b.total_bill_amount ?? null,
      outstandingAmount: b.outstandingAmount ?? b.outstanding_amount ?? null,
      status: b.status ?? "-",
    };
  }

  function renderBill(b) {
    connectionIdText.textContent = b.connectionId != null ? String(b.connectionId) : "-";
    billIdText.textContent = b.billId != null ? String(b.billId) : "-";

    const ps = formatDateTime(b.periodStart);
    const pe = formatDateTime(b.periodEnd);
    periodText.textContent = (ps && pe) ? `${ps} → ${pe}` : "-";

    statusText.textContent = b.status ?? "-";
    totalText.textContent = b.totalBillAmount != null ? `LKR ${money(b.totalBillAmount)}` : "-";
    outstandingText.textContent = b.outstandingAmount != null ? `LKR ${money(b.outstandingAmount)}` : "-";
  }

  function setBillEmpty() {
    billIdText.textContent = "-";
    periodText.textContent = "-";
    statusText.textContent = "-";
    totalText.textContent = "-";
    outstandingText.textContent = "-";
  }

  // ====== API: Submit Payment ======
  async function submitPayment() {
    if (!currentBill?.billId) {
      toast("No bill loaded.", "error");
      return;
    }

    const method = (methodSelect.value || "").trim().toUpperCase();
    if (!method) {
      toast("Select a payment method.", "error");
      return;
    }

    const payAmount = toNum(amountInput.value);
    if (!payAmount || payAmount <= 0) {
      toast("Enter a valid pay amount.", "error");
      return;
    }

    // Build payload expected by backend
    const payload = {
      billId: currentBill.billId,
      amount: payAmount,
      method: method,
      connectionId: currentBill.connectionId // ✅ helps if backend says "missing connection id"
    };

    if (method === "CASH") {
      const given = toNum(amountGivenInput.value);
      if (!given || given <= 0) {
        toast("Cash: amount given is required.", "error");
        return;
      }
      payload.cash = { amountGiven: given };
    }

    if (method === "CARD") {
      if (!cardPlatformName.value.trim() || !approvalCode.value.trim() || !cardType.value.trim()) {
        toast("Card: use Simulate Card Swipe or fill details.", "error");
        return;
      }
      payload.card = {
        platformName: cardPlatformName.value.trim(),
        cardType: cardType.value.trim().toUpperCase(),
        approvalCode: approvalCode.value.trim(),
        maskedCardNo: maskedCardNo.value.trim() || ""
      };
    }

    if (method === "BANK TRANSFER") {
      if (!bankName.value.trim() || !bankAccountNo.value.trim() || !txnNumber.value.trim()) {
        toast("Bank Transfer: simulate or fill details.", "error");
        return;
      }
      payload.bankTransfer = {
        bankName: bankName.value.trim(),
        accountNumber: bankAccountNo.value.trim(),
        transactionNum: txnNumber.value.trim()
      };
    }

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

      const data = await res.json();
      toast("Payment successful ✅", "success");
      debug(`Payment OK. ID: ${data.paymentId ?? "-"} | Status: ${data.status ?? "-"}`);

      // reload bill after payment
      await loadCurrentBill();
    } catch (err) {
      console.error(err);
      toast(err.message || "Payment failed", "error");
      debug("Payment failed. Check backend logs.");
    } finally {
      setBusy(false);
    }
  }

  // ====== UI helpers ======
  function updateMethodUI() {
    const m = (methodSelect.value || "").trim().toUpperCase();
    cashBox.style.display = (m === "CASH") ? "block" : "none";
    cardBox.style.display = (m === "CARD") ? "block" : "none";
    bankBox.style.display = (m === "BANK TRANSFER") ? "block" : "none";
  }

  function clearMethodFields() {
    amountGivenInput.value = "";
    balanceOutput.value = "";

    cardPlatformName.value = "";
    cardType.value = "";
    approvalCode.value = "";
    maskedCardNo.value = "";

    bankName.value = "";
    bankAccountNo.value = "";
    txnNumber.value = "";
  }

  function updateCashBalance() {
    const m = (methodSelect.value || "").trim().toUpperCase();
    if (m !== "CASH") return;

    const payAmount = toNum(amountInput.value);
    const given = toNum(amountGivenInput.value);

    if (!payAmount || !given) {
      balanceOutput.value = "0.00";
      return;
    }

    const change = given - payAmount;
    balanceOutput.value = money(change);
  }

  function setBusy(isBusy) {
    payBtn.disabled = isBusy;
    reloadBtn.disabled = isBusy;
    fillOutstandingBtn.disabled = isBusy;
  }

  function debug(msg) {
    if (debugInfo) debugInfo.textContent = msg || "";
  }

  // ====== Simulators ======
  function simulateCardSwipe() {
    const platforms = ["VISA", "MASTERCARD", "AMEX"];
    const platform = platforms[randInt(0, platforms.length - 1)];

    cardPlatformName.value = platform;
    cardType.value = Math.random() > 0.5 ? "CREDIT" : "DEBIT";
    approvalCode.value = `AP-${randInt(100000, 999999)}`;

    // Fake card number
    const last4 = randInt(1000, 9999);
    maskedCardNo.value = `**** **** **** ${last4}`;

    toast("Simulated card swipe ✅", "success");
  }

  function simulateBankTransfer() {
    const banks = ["BOC", "People's Bank", "HNB", "Commercial Bank", "Sampath", "NDB"];
    const bank = banks[randInt(0, banks.length - 1)];

    bankName.value = bank;
    bankAccountNo.value = String(randInt(1000000000, 9999999999));
    txnNumber.value = `TRX-${randInt(100000, 999999)}-${randInt(10, 99)}`;

    toast("Simulated bank transfer ✅", "success");
  }

  // ====== Utils ======
  function getConnectionId() {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("connectionId");
    if (q && /^\d+$/.test(q)) return parseInt(q, 10);

    const ls = localStorage.getItem("selectedConnectionId");
    if (ls && /^\d+$/.test(ls)) return parseInt(ls, 10);

    return null;
  }

  function getToken() {
    return localStorage.getItem("token") || localStorage.getItem("jwt") || "";
  }

  function money(val) {
    const n = typeof val === "number" ? val : parseFloat(val);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  }

  function toNum(v) {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  function toast(message, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;

    el.className = "toast active " + (type === "error" ? "error" : "success");
    el.textContent = message;

    setTimeout(() => {
      el.className = "toast";
    }, 2500);
  }
});
