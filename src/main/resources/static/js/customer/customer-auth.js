document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("customerLoggedIn");

    if (!isLoggedIn && window.location.pathname.includes("customer-dashboard")) {
        window.location.replace("../../customer-index.html");
    }
});

const isLoggedIn = localStorage.getItem("customerLoggedIn");

if (document.body.classList.contains("dashboard-page")) {
    if (!isLoggedIn) {
        window.location.href = "../../customer-index.html";
    }
}

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

let currentSlide = 0;
const slides = document.querySelectorAll(".slide-item");
const progress = document.querySelector(".progress");

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");

    if (progress) {
        progress.style.transition = "none";
        progress.style.width = "0%";

        progress.offsetHeight;

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
    window.location.replace("/customer-index.html");
}