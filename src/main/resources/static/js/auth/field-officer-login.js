console.log("Field Officer auth JS loaded");
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('login-error');

    if (!form) return;

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
            const response = await fetch('/api/auth/field-officer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                let errorMessage = "Invalid email or password.";

                try {
                    const err = await response.json();
                    if (err?.message) errorMessage = err.message;
                } catch {}

                showError(errorMessage);
                return;
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('email', data.email);
            localStorage.setItem('role', 'FIELD_OFFICER');

            window.location.href = '../field-officer/field-officer-dashboard.html';

        } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
        }
    });

    [emailInput, passwordInput].forEach(input =>
        input.addEventListener('input', hideError)
    );

    function showError(message) {
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    }

    function hideError() {
        errorBox.style.display = 'none';
        errorBox.innerText = '';
    }
});