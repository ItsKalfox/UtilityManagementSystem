(function authGuard() {
  const token = localStorage.getItem("token");
  if (!token) window.location.replace("../index.html");
})();

window.showToast = function (message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} active`;
  setTimeout(() => toast.classList.remove("active"), 3000);
};

window.showConfirmModal = function ({
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "OK",
  cancelText = "Cancel",
  danger = false
} = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const overlay = document.getElementById("confirmOverlay");
    if (!modal || !overlay) {
      resolve({ confirmed: false });
      return;
    }

    modal.innerHTML = `
      <div class="modal-header">
        <img src="../images/${danger ? "warning-icon.svg" : "save-icon.svg"}" alt="">
        <h3>${title}</h3>
      </div>

      <div class="modal-body">
        <p class="confirm-text">${message}</p>
      </div>

      <div class="modal-footer">
        <button class="btn-conf ${danger ? "btn-delete" : "btn-save"}" id="confirmOkBtn">${confirmText}</button>
        <button class="btn-conf btn-secondary" id="confirmCancelBtn">${cancelText}</button>
      </div>
    `;

    modal.classList.add("active");
    overlay.classList.add("active");

    const okBtn = modal.querySelector("#confirmOkBtn");
    const cancelBtn = modal.querySelector("#confirmCancelBtn");

    function cleanup() {
      modal.classList.remove("active");
      overlay.classList.remove("active");
      document.removeEventListener("keydown", handleKey);
      overlay.removeEventListener("click", onOverlay);
    }

    function onOverlay() {
      cleanup();
      resolve({ confirmed: false });
    }

    function handleKey(e) {
      if (e.key === "Enter") okBtn?.click();
      if (e.key === "Escape") cancelBtn?.click();
    }

    document.addEventListener("keydown", handleKey);
    overlay.addEventListener("click", onOverlay);

    cancelBtn.onclick = () => {
      cleanup();
      resolve({ confirmed: false });
    };

    okBtn.onclick = () => {
      cleanup();
      resolve({ confirmed: true });
    };
  });
};
