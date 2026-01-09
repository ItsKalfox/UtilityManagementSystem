document.addEventListener("DOMContentLoaded", () => {
  const sidebarNav = document.getElementById("sidebarNav");
  const navItems = sidebarNav ? sidebarNav.querySelectorAll(".nav-item") : [];

  const fullNameEl = document.getElementById("fullName");
  const emailEl = document.getElementById("email");
  const avatarEl = document.getElementById("userAvatar");
  const roleEl = document.getElementById("userRole");

  const logoutBtn = document.getElementById("logoutBtn");
  const settingsBtn = document.getElementById("settingsBtn");

  const confirmOverlay = document.getElementById("confirmOverlay");
  const confirmModal = document.getElementById("confirmModal");

  const fullName = localStorage.getItem("fullName") || "Cashier";
  const email = localStorage.getItem("email") || "cashier@ums.com";

  if (fullNameEl) fullNameEl.textContent = fullName;
  if (emailEl) emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = String(fullName).charAt(0).toUpperCase();
  if (roleEl) roleEl.textContent = "Cashier";

  // Sidebar navigation
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      showPage(item.dataset.page);
    });
  });

  function showPage(page) {
    document.querySelectorAll(".page-section").forEach((sec) => {
      sec.classList.toggle("hidden", sec.dataset.page !== page);
    });

    if (page === "dashboard" && window.CashierBillsDashboard?.loadBills) {
      window.CashierBillsDashboard.loadBills();
    }
    if (page === "customer-info") {
      document.getElementById("customerSearchInput")?.focus();
      // optional: ensure initial customers load when visiting the page
      window.CashierCustomerInfo?.loadInitial?.();
    }
    if (page === "bill-history" && window.CashierBillHistory?.loadBills) {
      window.CashierBillHistory.loadBills();
    }
  }

  // Toast helper
  function safeToast(message, type = "success") {
    if (typeof window.toast === "function") {
      window.toast(message, type);
      return;
    }
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast active " + (type === "error" ? "error" : "success");
    el.textContent = message;
    setTimeout(() => (el.className = "toast"), 2500);
  }

  // Blur helper
  function blurOn() { document.body.classList.add("modal-blur-on"); }
  function blurOff() { document.body.classList.remove("modal-blur-on"); }

  // ===== Confirm modal =====
  function showConfirmModal({
    title = "Confirm",
    message = "Are you sure?",
    confirmText = "OK",
    cancelText = "Cancel",
    danger = false
  } = {}) {
    return new Promise((resolve) => {
      if (!confirmOverlay || !confirmModal) {
        resolve({ confirmed: false });
        return;
      }

      confirmModal.innerHTML = `
        <div class="modal-header">
          <img src="../images/${danger ? "warning-icon.svg" : "save-icon.svg"}" alt="icon">
          <h3>${escapeHtml(title)}</h3>
        </div>

        <div class="modal-body">
          <p class="confirm-text">${escapeHtml(message)}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-conf ${danger ? "btn-delete" : "btn-save"}" id="confirmOkBtn">
            ${escapeHtml(confirmText)}
          </button>
          <button class="btn-conf btn-secondary" id="confirmCancelBtn">
            ${escapeHtml(cancelText)}
          </button>
        </div>
      `;

      confirmOverlay.classList.add("active");
      confirmModal.classList.add("active");
      confirmOverlay.style.display = "block";
      confirmModal.style.display = "block";
      blurOn();

      const okBtn = confirmModal.querySelector("#confirmOkBtn");
      const cancelBtn = confirmModal.querySelector("#confirmCancelBtn");

      const cleanup = (result) => {
        confirmModal.classList.remove("active");
        confirmOverlay.classList.remove("active");
        confirmModal.style.display = "none";
        confirmOverlay.style.display = "none";
        blurOff();
        resolve(result);
      };

      cancelBtn && (cancelBtn.onclick = () => cleanup({ confirmed: false }));
      okBtn && (okBtn.onclick = () => cleanup({ confirmed: true }));

      confirmOverlay.onclick = () => cleanup({ confirmed: false });

      const onKey = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", onKey);
          cleanup({ confirmed: false });
        }
      };
      document.addEventListener("keydown", onKey);
    });
  }

  window.hideConfirmModal = function () {
    if (!confirmOverlay || !confirmModal) return;
    confirmOverlay.classList.remove("active");
    confirmModal.classList.remove("active");
    confirmOverlay.style.display = "none";
    confirmModal.style.display = "none";
    blurOff();
  };

  settingsBtn?.addEventListener("click", () => {
    safeToast("Settings feature coming soon", "success");
  });

  logoutBtn?.addEventListener("click", async () => {
    const result = await showConfirmModal({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Yes",
      cancelText: "No",
      danger: true
    });

    if (!result?.confirmed) return;

    safeToast("Logging out...", "success");

    setTimeout(() => {
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme !== null) localStorage.setItem("theme", theme);
      window.location.replace("../index.html");
    }, 250);
  });

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =========================
  // ✅ Page Modal (Card-only fixed)
  // =========================
  const pageOverlay = document.getElementById("pageModalOverlay");
  const pageModal = document.getElementById("pageModal");
  const pageTitle = document.getElementById("pageModalTitle");
  const pageCloseBtn = document.getElementById("pageModalCloseBtn");
  const pageBody = document.getElementById("pageModalBody");

  let currentModalCleanup = null;

  function openPageModal({
    title = "Details",
    html = "",
    onMount = null,
    // ✅ NEW: layout controls
    chromeless = false,
    cardOnly = false
  } = {}) {
    if (!pageOverlay || !pageModal || !pageBody) return;

    try { currentModalCleanup?.(); } catch {}
    currentModalCleanup = null;

    // ✅ Apply classes that your CSS expects
    pageModal.classList.toggle("chromeless", !!chromeless);
    pageModal.classList.toggle("card-only", !!cardOnly);

    // If chromeless, we still set title for accessibility/debug, but header is hidden by CSS
    if (pageTitle) pageTitle.textContent = title;

    pageBody.innerHTML = html;

    pageOverlay.classList.add("active");
    pageModal.classList.add("active");
    pageOverlay.style.display = "block";
    pageModal.style.display = "block";
    blurOn();

    const close = () => closePageModal();

    pageOverlay.onclick = close;
    pageCloseBtn && (pageCloseBtn.onclick = close);

    const onKey = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", onKey);
        closePageModal();
      }
    };
    document.addEventListener("keydown", onKey);

    if (typeof onMount === "function") {
      const cleanup = onMount(pageBody);
      if (typeof cleanup === "function") currentModalCleanup = cleanup;
    }
  }

  function closePageModal() {
    if (!pageOverlay || !pageModal || !pageBody) return;

    try { currentModalCleanup?.(); } catch {}
    currentModalCleanup = null;

    pageOverlay.classList.remove("active");
    pageModal.classList.remove("active");
    pageOverlay.style.display = "none";
    pageModal.style.display = "none";

    // reset mode classes
    pageModal.classList.remove("chromeless", "card-only");

    pageBody.innerHTML = "";
    blurOff();
  }

  window.openPageModal = openPageModal;
  window.closePageModal = closePageModal;

  // ✅ Convenience wrappers (use card-only mode)
  window.openPayBillModal = function (connectionId) {
    if (!window.CashierPayBillModal) {
      safeToast("CashierPayBillModal not loaded", "error");
      return;
    }
    openPageModal({
      title: "Pay Bill",
      chromeless: true,
      cardOnly: true,
      html: window.CashierPayBillModal.template(),
      onMount: (mountEl) => window.CashierPayBillModal.init(mountEl, { connectionId })
    });
  };

  window.openBillDetailModal = function (billId, connectionId) {
    if (!window.CashierBillDetailModal) {
      safeToast("CashierBillDetailModal not loaded", "error");
      return;
    }
    openPageModal({
      title: "Bill Details",
      chromeless: true,
      cardOnly: true,
      html: window.CashierBillDetailModal.template(),
      onMount: (mountEl) => window.CashierBillDetailModal.init(mountEl, { billId, connectionId })
    });
  };

  window.openReceiptModal = function (receipt) {
    if (!window.CashierReceiptModal) {
      safeToast("CashierReceiptModal not loaded", "error");
      return;
    }
    openPageModal({
      title: "Receipt",
      chromeless: true,
      cardOnly: true,
      html: window.CashierReceiptModal.template(),
      onMount: (mountEl) => window.CashierReceiptModal.init(mountEl, { receipt })
    });
  };

  // Default page + init modules once
  showPage("dashboard");
  window.CashierBillsDashboard?.init?.();
  window.CashierCustomerInfo?.init?.();
  window.CashierBillHistory?.init?.();
});
