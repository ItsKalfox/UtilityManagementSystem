// ==========================================
// CUSTOMER DASHBOARD – TARIFF PLAN HANDLING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Get logged-in customer ID
    const customerId = localStorage.getItem("customerId");

    // If customer not logged in → redirect
    if (!customerId) {
        window.location.href = "/CustomerLogin.html";
        return;
    }

    // Load tariff history
    loadTariffHistory(customerId);
});

// ==========================================
// LOAD TARIFF HISTORY FROM BACKEND
// ==========================================
function loadTariffHistory(customerId) {
    fetch(`/api/customer/${customerId}/tariff-history`)
        .then(response => response.json())
        .then(data => renderTariffHistory(data))
        .catch(error => {
            console.error("Error loading tariff history:", error);
        });
}

// ==========================================
// RENDER TARIFF HISTORY + CURRENT TARIFF
// ==========================================
function renderTariffHistory(data) {

    const historyContainer = document.getElementById("tariffHistoryContainer");
    const currentContainer = document.getElementById("currentTariffCard");

    if (!historyContainer || !currentContainer) {
        console.error("Tariff containers not found in HTML");
        return;
    }

    historyContainer.innerHTML = "";
    currentContainer.innerHTML = "";

    if (!data || data.length === 0) {
        historyContainer.innerHTML = "<p>No tariff history available.</p>";
        return;
    }

    data.forEach(row => {
        const isActive = row[7] === "ACTIVE";

        // ⭐ CURRENT ACTIVE TARIFF
        if (isActive) {
            currentContainer.innerHTML = `
                <div class="plan-card active-plan">
                    <h3 class="plan-title">${row[0]}</h3>

                    <div class="plan-price">
                        <span>LKR</span>${row[2]}
                        <small>/month</small>
                    </div>

                    <ul class="plan-features">
                        <li>Utility: ${row[1]}</li>
                        <li>Tax: ${row[3]}%</li>
                        <li>Prorated: ${row[4] ? "Yes" : "No"}</li>
                        <li>Meter No: ${row[5]}</li>
                    </ul>

                    <div class="plan-badge">CURRENT PLAN</div>
                </div>
            `;
        }

        // 📜 HISTORY CARD (ALL TARIFFS)
        const card = document.createElement("div");
        card.className = "plan-card";

        card.innerHTML = `
            <h3 class="plan-title">${row[0]}</h3>

            <div class="plan-price">
                <span>LKR</span>${row[2]}
                <small>/month</small>
            </div>

            <ul class="plan-features">
                <li>Utility: ${row[1]}</li>
                <li>Tax: ${row[3]}%</li>
                <li>Installed: ${new Date(row[6]).toLocaleDateString()}</li>
                <li>Status: ${row[7]}</li>
            </ul>
        `;

        historyContainer.appendChild(card);
    });
}
