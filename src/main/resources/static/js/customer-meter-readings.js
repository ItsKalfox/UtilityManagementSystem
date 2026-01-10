console.log("✅ Meter Readings JS Loaded");

document.addEventListener("DOMContentLoaded", () => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) return;

    fetch(`/api/customer/${customerId}/meter-readings`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) return;

            renderSummaryCards(data);
            renderTable(data);
            renderChart(data);
        })
        .catch(err => console.error(err));
});

// ================= SUMMARY CARDS =================
function renderSummaryCards(data) {
    const totalUnits = data.reduce((sum, r) => sum + r[2], 0);
    const avg = (totalUnits / data.length).toFixed(2);
    const peak = Math.max(...data.map(r => Number(r[3] || 0)));
    const last = data[data.length - 1][2];

    document.getElementById("totalUnits").innerText = totalUnits;
    document.getElementById("avgPerDay").innerText = avg;
    document.getElementById("peakValue").innerText = peak;
    document.getElementById("lastReading").innerText = last;
}

// ================= TABLE =================
function renderTable(data) {
    const tbody = document.getElementById("meterTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(r[0]).toLocaleString()}</td>
            <td>${new Date(r[1]).toLocaleString()}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ================= CHART =================
let meterChartInstance = null;

function renderChart(data) {
    const canvas = document.getElementById("meterChart");
    if (!canvas) return;

    const labels = data.map(r =>
        new Date(r[0]).toLocaleString()
    );

    const units = data.map(r => r[2]);

    // Destroy old chart if exists
    if (meterChartInstance) {
        meterChartInstance.destroy();
    }

    meterChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Units Consumed",
                data: units,
                borderColor: "#1f7a55",
                backgroundColor: "rgba(31,122,85,0.25)",
                tension: 0.4,
                fill: true,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
