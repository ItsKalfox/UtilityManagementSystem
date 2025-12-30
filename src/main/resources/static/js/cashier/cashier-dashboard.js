document.addEventListener("DOMContentLoaded", () => {
    const sidebarNav = document.getElementById("sidebarNav");
    const navItems = sidebarNav.querySelectorAll(".nav-item");
    const pageContent = document.getElementById("pageContent");

    const fullNameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const avatarEl = document.getElementById("userAvatar");
    const roleEl = document.getElementById("userRole");

    const logoutBtn = document.getElementById("logoutBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // ✅ Load user info from localStorage
    const fullName = localStorage.getItem("fullName") || "Cashier";
    const email = localStorage.getItem("email") || "cashier@ums.com";

    fullNameEl.textContent = fullName;
    emailEl.textContent = email;
    avatarEl.textContent = fullName.charAt(0).toUpperCase();
    roleEl.textContent = "Cashier";

    // ✅ Sidebar click logic (active highlight + load content)
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const page = item.dataset.page;
            loadPage(page);
        });
    });

    function loadPage(page) {
        // 🔥 Dummy pages for now (replace later)
        switch (page) {
            case "home":
                pageContent.innerHTML = `
                    <h2>Cashier Dashboard</h2>
                    <p>Welcome, <strong>${fullName}</strong>.</p>
                    <p>Select a sidebar option to begin.</p>
                `;
                break;

            case "search-bill":
                pageContent.innerHTML = `
                    <h2>Search Bill</h2>
                    <p>(Dummy UI) Search by Connection ID / Bill ID</p>
                    <input type="text" placeholder="Enter Bill ID" style="padding:10px; width:280px;">
                    <button class="login-btn" style="margin-top:10px;">Search</button>
                `;
                break;

            case "payments":
                pageContent.innerHTML = `
                    <h2>Payments</h2>
                    <p>(Dummy UI) Payment form will be built here.</p>
                    <button class="login-btn">Create Payment</button>
                `;
                break;

            case "payment-history":
                pageContent.innerHTML = `
                    <h2>Payment History</h2>
                    <p>(Dummy UI) Payment history table will be shown here.</p>
                `;
                break;

            case "reports":
                pageContent.innerHTML = `
                    <h2>Reports</h2>
                    <p>(Dummy UI) Reports section (future feature)</p>
                `;
                break;

            default:
                pageContent.innerHTML = `
                    <h2>Page Not Found</h2>
                    <p>Invalid page selected.</p>
                `;
        }
    }

    // ✅ Logout
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../index.html";
    });

    // ✅ Settings (dummy)
    settingsBtn.addEventListener("click", () => {
        showToast("Settings feature coming soon 😄");
    });

    // ✅ Toast helper (optional)
    function showToast(msg) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = msg;
        toast.classList.add("show");

        setTimeout(() => toast.classList.remove("show"), 2500);
    }

    // Load default page
    loadPage("home");
});
