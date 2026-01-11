console.log("Revenue Report JS loaded");

document.getElementById("applyFilter").addEventListener("click", () => {

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const utilityType = document.getElementById("utilityType").value;

    fetch("/api/manager/revenue/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, utilityType })
    })
        .then(res => res.json())
        .then(data => {

            const recordsContainer = document.getElementById("revenueRecords");
            const totalRevenueEl = document.getElementById("totalRevenue");

            recordsContainer.innerHTML = "";
            let total = 0;

            data.forEach((row, index) => {
                total += row.amount;

                const record = document.createElement("div");
                record.className = "record-item record-info";

                record.innerHTML = `
            <div>#${index + 1}</div>
            <div>${row.customerName}</div>
            <div>${row.utilityType}</div>
            <div>Rs. ${row.amount.toFixed(2)}</div>
            <div>${row.paymentStatus}</div>
        `;

                recordsContainer.appendChild(record);
            });

            totalRevenueEl.innerText = "Rs. " + total.toFixed(2);
        })

        .catch(err => console.error(err));
});