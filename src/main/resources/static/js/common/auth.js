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
            const response = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                let errorMessage = "Invalid email or password.";

                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                }

                showError(errorMessage);
                return;

            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('email', data.email);
            localStorage.setItem('adminRole', data.adminRole);
            localStorage.setItem('permissions', JSON.stringify(data.permissions));

            window.location.href = '../admin/dashboard.html';

        } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
        }
    });

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', hideError);
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