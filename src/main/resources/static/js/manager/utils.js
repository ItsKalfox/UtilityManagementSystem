(function authGuard() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.replace("../index.html");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    initHeaderSafe();
});

/** Manager header init (won't crash if some ids don't exist) */
function initHeaderSafe() {
    const fullName = localStorage.getItem("fullName") || "Manager";
    const email = localStorage.getItem("email") || "manager@ums.com";

    const fullNameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const avatarEl = document.getElementById("userAvatar");

    if (fullNameEl) fullNameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = String(fullName).charAt(0).toUpperCase();
}

window.handleLogout = async function () {
    const result = await showConfirmModal({
        title: "Logout",
        message: "Are you sure you want to logout?",
        confirmText: "Yes",
        cancelText: "No",
        danger: true,
    });

    if (!result || !result.confirmed) return;

    const theme = localStorage.getItem("theme");

    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("permissions");
    localStorage.removeItem("role");

    if (theme !== null) localStorage.setItem("theme", theme);

    window.location.replace("../index.html");
};

window.handleSettings = function () {
    window.location.href = "../temp.html";
};

function showConfirmModal({
                              title = "Confirm",
                              message = "Are you sure?",
                              confirmText = "OK",
                              cancelText = "Cancel",
                              danger = false,
                          }) {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        const overlay = document.getElementById("confirmOverlay");

        if (!modal || !overlay) {
            const ok = confirm(message);
            resolve({ confirmed: ok });
            return;
        }

        modal.innerHTML = `
      <div class="modal-header">
        <img src="../images/${danger ? "warning-icon.svg" : "save-icon.svg"}" alt="Confirm">
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

        modal.classList.add("active");
        overlay.classList.add("active");

        const okBtn = modal.querySelector("#confirmOkBtn");
        const cancelBtn = modal.querySelector("#confirmCancelBtn");

        function handleKey(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                okBtn.click();
            }
            if (e.key === "Escape") {
                e.preventDefault();
                cancelBtn.click();
            }
        }

        document.addEventListener("keydown", handleKey);

        cancelBtn.onclick = () => {
            cleanup();
            resolve({ confirmed: false });
        };

        okBtn.onclick = () => {
            cleanup();
            resolve({ confirmed: true });
        };

        overlay.onclick = () => {
            cleanup();
            resolve({ confirmed: false });
        };

        function cleanup() {
            modal.classList.remove("active");
            overlay.classList.remove("active");
            document.removeEventListener("keydown", handleKey);
        }
    });
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
