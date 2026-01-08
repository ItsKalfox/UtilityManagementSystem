console.log("Manager Dashboard JS loaded");

// ===== KPI VALUES (TEMP DATA – BACKEND LATER) =====
document.getElementById("totalRevenue").innerText = "Rs. 450,000";
document.getElementById("totalUnpaid").innerText = "Rs. 75,000";
document.getElementById("totalCustomers").innerText = "120";

// ===== BAR CHART: MONTHLY REVENUE =====
const monthlyCtx = document
    .getElementById("monthlyRevenueChart")
    .getContext("2d");

new Chart(monthlyCtx, {
    type: "bar",
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
            label: "Revenue (Rs)",
            data: [50000, 72000, 68000, 90000, 85000, 95000],
            backgroundColor: "#3b82f6"
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});

// ===== PIE CHART: UTILITY WISE REVENUE =====
const utilityCtx = document
    .getElementById("utilityRevenueChart")
    .getContext("2d");

new Chart(utilityCtx, {
    type: "pie",
    data: {
        labels: ["Electricity", "Water", "Gas"],
        datasets: [{
            data: [55, 30, 15],
            backgroundColor: [
                "#22c55e",
                "#0ea5e9",
                "#f97316"
            ]
        }]
    },
    options: {
        responsive: true
    }
});

