console.log("✅ CustomerLogin.js loaded");
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Login form submitted");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    })
    .then(data => {
        console.log("Login success:", data);

        localStorage.setItem("customerId", data.userId);
        localStorage.setItem("customerEmail", data.email);
        localStorage.setItem("customerLoggedIn", "true");

        window.location.replace("customer/customer-dashboard.html");
    })

    .catch(err => alert("Login failed"));
});