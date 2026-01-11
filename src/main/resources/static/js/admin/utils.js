(function authGuard() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('../../index.html');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    applyPermissionVisibility('customerManagementTab', 'READ_CUSTOMER');
    applyPermissionVisibility('managerManagementTab', 'READ_MANAGER');
    applyPermissionVisibility('cashierManagementTab', 'READ_CASHIER');
    applyPermissionVisibility('fieldOfficerManagementTab', 'READ_FIELD_OFFICER');
    applyPermissionVisibility('adminManagementTab', 'READ_ADMIN');
    applyPermissionVisibility('roleCreationTab', 'MANAGE_ADMIN_ROLES');
    applyPermissionVisibility('areaCreationTab', 'MANAGE_AREAS');
    applyPermissionVisibility('adminActionLogTab', 'READ_ACTION_LOGS');
    applyPermissionVisibility('tariffCreationTab', 'READ_TARIFFS');
    applyPermissionVisibility('connectionCreationTab', 'MANAGE_COMPLAINTS');
});

function initDashboard() {
    const fullName = localStorage.getItem('fullName') || 'Admin User';
    const email = localStorage.getItem('email') || 'admin@ums.com';
    const adminRole = localStorage.getItem('adminRole') || 'admin';

    document.getElementById('fullName').textContent = fullName.charAt(0).toUpperCase() + fullName.slice(1);
    document.getElementById('email').textContent = email;
    const formattedRole = adminRole
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    document.getElementById('adminRole').textContent = formattedRole ;
    document.getElementById('userAvatar').textContent = fullName.charAt(0).toUpperCase();
}

window.handleLogout = async function() {
    const result = await showConfirmModal({
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        confirmText: 'Yes',
        cancelText: 'No',
        danger: true
    });

    if (!result || !result.confirmed) {
        return;
    }
    const theme = localStorage.getItem('theme');

    localStorage.clear();

    if (theme !== null) {
        localStorage.setItem('theme', theme);
    }

    window.location.replace('../../index.html');
};

window.handleSettings = function() {
    window.location.href = '../../temp.html';
};

function showConfirmModal({
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'OK',
    cancelText = 'Cancel',
    danger = false
}) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirmModal');
        const overlay = document.getElementById('confirmOverlay');

        modal.innerHTML = `
            <div class="modal-header">
                <img src="../../images/${danger ? 'warning-icon.svg' : 'save-icon.svg'}">
                <h3>${title}</h3>
            </div>

            <div class="modal-body">
                <p class="confirm-text">${message}</p>
            </div>

            <div class="modal-footer">
                <button class="btn-conf ${danger ? 'btn-delete' : 'btn-save'}" id="confirmOkBtn">
                    ${confirmText}
                </button>
                <button class="btn-conf btn-secondary" id="confirmCancelBtn">
                    ${cancelText}
                </button>
            </div>
        `;

        modal.classList.add('active');
        overlay.classList.add('active');

        const okBtn = modal.querySelector('#confirmOkBtn');
        const cancelBtn = modal.querySelector('#confirmCancelBtn');

        function handleKey(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                okBtn.click();
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                cancelBtn.click();
            }
        }

        document.addEventListener('keydown', handleKey);

        cancelBtn.onclick = () => {
            cleanup();
            resolve({ confirmed: false });
        };

        okBtn.onclick = () => {
            resolve({
                confirmed: true,
                setLoading,
                close: cleanup
            });
        };

        function setLoading() {
            okBtn.disabled = true;
            cancelBtn.disabled = true;
            okBtn.innerHTML = `
                <span class="dot-loader">
                    <span></span><span></span><span></span>
                </span>`;
        }

        function cleanup() {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        }
    });
}

function hasPermission(permission) {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || [];
    return permissions.includes(permission);
}

function handleTokenExpired() {
    return new Promise(resolve => {
        const modal = document.getElementById('confirmModal');
        const overlay = document.getElementById('confirmOverlay');

        modal.classList.add('modal-confirm');

        modal.innerHTML = `
            <div class="modal-header">
                <img src="../../images/warning-icon.svg" alt="Confirm">
                <h3>Token Expired!</h3>
            </div>

            <div class="modal-body">
                <p class="confirm-text">
                    Access token expired. You need to login again.
                </p>
            </div>

            <div class="modal-footer">
                <button class="btn-conf btn-edit" id="confirmOkBtn">
                    OK
                </button>
            </div>
        `;

        function cleanup(result) {
            modal.classList.remove('active', 'modal-confirm');
            overlay.classList.remove('active');
            resolve(result);
        }

        document.getElementById('confirmOkBtn').onclick = () => cleanup(true);

        modal.classList.add('active');
        overlay.classList.add('active');
    });
}

window.closeModal = function() {
    const modal = document.getElementById('recordModal');

    modal.classList.remove('active');
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    isEditMode = false;
    currentEditRecord = null;
};

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

window.toggleExpandable = function() {
    const content = document.getElementById('expandableContent');
    const icon = document.getElementById('expandIcon');

    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
};

function applyPermissionVisibility(id, permission) {
    const el = document.getElementById(id);
    if (!el) return;

    if (id == "addCustomerBtn" || id == "addManagerBtn" || id == "addCashierBtn" || id == "addFieldOfficerBtn" || id == "addAdminBtn"
    || id=="addAreaBtn" || id=="addRoleBtn" || id=="addTariffBtn" || id=="addConnectionBtn"){
        el.style.display = hasPermission(permission) ? 'block' : 'none';
        return
    }

    el.style.display = hasPermission(permission) ? 'flex' : 'none';
}