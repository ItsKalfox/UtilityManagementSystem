document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("customerLoggedIn");

    // If NOT logged in and trying to access dashboard
    if (!isLoggedIn && window.location.pathname.includes("CustomerDashboard")) {
        window.location.replace("/CustomerLogin.html");
    }
});

// ==================================================
// AUTH STATUS
// ==================================================
const isLoggedIn = localStorage.getItem("customerLoggedIn");

// ==================================================
// PAGE GUARD (PROTECT DASHBOARD PAGE)
// ==================================================
if (document.body.classList.contains("dashboard-page")) {
    if (!isLoggedIn) {
       // window.location.href = "/CustomerDashboard.html";
        window.location.href = "/CustomerLogin.html";
    }
}

// ==================================================
// SIGN-IN MODAL OPEN / CLOSE (LANDING PAGE)
// ==================================================
const openBtn = document.getElementById("openSignup");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("signupModal");

if (openBtn) {
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    });
}



// ==================================================
// NAVIGATION BLOCK BEFORE LOGIN
// ==================================================
const restrictedLinks = document.querySelectorAll(
    'a[href="#bill"], a[href="#tariff"], a[href="#meter"], a[href="#complaint"]'
);

restrictedLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        if (!localStorage.getItem("customerLoggedIn")) {
            e.preventDefault();
            alert("Please sign in first.");
        }
    });
});

// ==================================================
// SLIDESHOW (3 IMAGES)
// ==================================================
let currentSlide = 0;
const slides = document.querySelectorAll(".slide-item");
const progress = document.querySelector(".progress");

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");

    if (progress) {
        // 1️⃣ Remove transition
        progress.style.transition = "none";
        progress.style.width = "0%";

        // 2️⃣ FORCE browser reflow 🔥
        progress.offsetHeight; // <-- THIS LINE IS THE MAGIC

        // 3️⃣ Re-apply transition
        progress.style.transition = "width 6s linear";
        progress.style.width = "100%";
    }
}


if (slides.length > 0) {
    showSlide(currentSlide);

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 6000);
}

// ==================================================
// LIVE DATE & TIME
// ==================================================
function updateDateTime() {
    const dt = document.getElementById("datetime");
    if (!dt) return;

    const now = new Date();
    dt.innerHTML =
        now.toLocaleDateString() + " | " + now.toLocaleTimeString();
}

setInterval(updateDateTime, 1000);
updateDateTime();

function logout() {
    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("customerToken");
    window.location.replace("/CustomerLogin.html");
}
