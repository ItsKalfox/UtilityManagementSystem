console.log("Manager Dashboard JS loaded");

fetch("/api/manager/dashboard")
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalRevenue").innerText =
            "Rs. " + data.totalRevenue;

        document.getElementById("totalUnpaid").innerText =
            "Rs. " + data.totalUnpaid;

        document.getElementById("totalCustomers").innerText =
            data.totalCustomers;
    })
    .catch(err => console.error("Dashboard API error:", err));

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