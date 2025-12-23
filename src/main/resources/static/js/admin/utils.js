(function authGuard() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('../../index.html');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
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
    const confirmed = await showConfirmModal({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    confirmText: 'Yes',
    cancelText: 'No',
    danger: true
    });

    if (!confirmed) return;

    // preserve theme
    const theme = localStorage.getItem('theme');

    localStorage.clear();

    // restore theme
    if (theme !== null) {
        localStorage.setItem('theme', theme);
    }

    window.location.replace('../../index.html');
};

window.handleSettings = function() {
    window.location.href = '../../temp.html';
};