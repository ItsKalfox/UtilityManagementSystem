document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Please fill all required fields.");
            return;
        }

        hideError();

        try {
            const response = await fetch('/api/auth/cashier/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                let msg = "Invalid email or password.";
                try {
                    const err = await response.json();
                    if (err.message) msg = err.message;
                } catch (_) {}
                showError(msg);
                return;
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('email', data.email);
            localStorage.setItem('permissions', JSON.stringify(data.permissions));

            window.location.href = '../cashier/cashier-dashboard.html';

        } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
        }
    });

    function showError(message) {
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    }

    function hideError() {
        errorBox.style.display = 'none';
        errorBox.innerText = '';
    }
});