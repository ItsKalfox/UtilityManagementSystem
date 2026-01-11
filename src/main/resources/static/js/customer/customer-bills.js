document.addEventListener("DOMContentLoaded", loadBills);

function loadBills() {
    const email = localStorage.getItem("customerEmail");

    if (!email) {
        window.location.href = "/customer-index.html";
        return;
    }


    if (!email) {
        window.location.href = "customer-index.html";
        console.error("Customer email not found in localStorage");
        return;
    }

    fetch(`http://localhost:8080/api/customer/bills?email=${email}`)
        .then(response => response.json())
        .then(data => renderBills(data))
        .catch(error => console.error("Error loading bills:", error));
}

function renderBills(bills) {
    const tbody = document.getElementById("billTableBody");

    if (!tbody) {
        console.error("Bill table body not found");
        return;
    }

    tbody.innerHTML = "";

    bills.forEach(bill => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                ${new Date(bill.periodStart).toLocaleDateString()} -
                ${new Date(bill.periodEnd).toLocaleDateString()}
            </td>
            <td>${bill.utilityType}</td>
            <td>LKR ${bill.totalAmount.toFixed(2)}</td>
            <td>LKR ${bill.outstandingAmount.toFixed(2)}</td>
            <td class="${bill.status === 'FULLY PAID' ? 'paid' : 'due'}">
                ${bill.status}
            </td>
        `;

        tbody.appendChild(row);
    });
}