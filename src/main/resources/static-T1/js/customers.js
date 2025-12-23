if (!hasPermission("READ_CUSTOMER")) {
  document.getElementById("customerAccessMsg").innerText = "No access";
}

async function loadCustomers() {
  const res = await fetch("http://localhost:8080/customers");
  const data = await res.json();

  const list = document.getElementById("customersList");
  list.innerHTML = "";

  data.content.forEach(c => {
    const row = document.createElement("div");
    row.innerHTML = `
      ${c.userId} - ${c.fullName} (${c.customerType})
      <button onclick="viewCustomer(${c.userId})">View</button>
    `;
    list.appendChild(row);
  });
}

async function viewCustomer(id) {
  const res = await fetch(`http://localhost:8080/customers/${id}`);
  const c = await res.json();

  const modal = document.getElementById("customerModal");
  modal.innerHTML = `
    <div class="modal-box">
      <button onclick="closeModal()">X</button>
      <pre>${JSON.stringify(c, null, 2)}</pre>
    </div>
  `;
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("customerModal").classList.add("hidden");
}

loadCustomers();
