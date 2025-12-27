export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    });

    if (response.status === 401) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (data.message === 'Token expired') {
            handleTokenExpired();
            return;
        }
    }

    return response;
}

async function handleTokenExpired() {
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) localStorage.setItem('theme', theme);

    await showConfirmModal({
        title: 'Session Expired',
        message: 'Your session has expired. Please login again.',
        confirmText: 'Login',
        cancelText: 'Close',
        danger: true
    });

    window.location.replace('../../index.html');
}