
let linkedConnectionId = null;
let allConnections = [];

document.addEventListener("DOMContentLoaded", () => {
    // Load all connections on page load
    fetchConnections();

    // Wire controls
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");
    const filterUtilityType = document.getElementById("filterUtilityType");
    const sortBySelect = document.getElementById("sortBySelect");
    const sortOrderSelect = document.getElementById("sortOrderSelect");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (filterStatus) filterStatus.addEventListener("change", applyFilters);
    if (filterUtilityType) filterUtilityType.addEventListener("change", applyFilters);
    if (sortBySelect) sortBySelect.addEventListener("change", applyFilters);
    if (sortOrderSelect) sortOrderSelect.addEventListener("change", applyFilters);
});


function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

function toDateInputValue(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    // yyyy-mm-dd for <input type="date">
    return d.toISOString().split("T")[0];
}


async function fetchConnections() {
    try {
        const res = await fetch("/connections", { headers: authHeader() });
        if (!res.ok) throw new Error("Failed to fetch connections");

        allConnections = await res.json();
        applyFilters();
    } catch (err) {
        console.error(err);
        showToast("Error loading connections", "error");
    }
}

window.refreshAudits = function () {
    fetchConnections();
};


function applyFilters() {
    const searchValue = (document.getElementById("searchInput")?.value || "")
        .trim()
        .toLowerCase();

    const status = document.getElementById("filterStatus")?.value || "all";
    const utility = document.getElementById("filterUtilityType")?.value || "all";

    const sortBy = document.getElementById("sortBySelect")?.value || "connectionId";
    const sortOrder = document.getElementById("sortOrderSelect")?.value || "asc";

    let list = Array.isArray(allConnections) ? [...allConnections] : [];

    if (status !== "all") {
        list = list.filter((c) => String(c.status || "").toUpperCase() === status);
    }

    if (utility !== "all") {
        list = list.filter(
            (c) => String(c.utility_type || "").toUpperCase() === utility
        );
    }

    if (searchValue) {
        list = list.filter((c) => {
            const meter = String(c.meter_serial_number || "").toLowerCase();
            const customerId = String(c.customer_id ?? "").toLowerCase();
            const connectionId = String(c.connection_id ?? "").toLowerCase();
            const tariffId = String(c.tariff_id ?? "").toLowerCase();
            return (
                meter.includes(searchValue) ||
                customerId.includes(searchValue) ||
                connectionId.includes(searchValue) ||
                tariffId.includes(searchValue)
            );
        });
    }

    list.sort((a, b) => {
        let va, vb;

        if (sortBy === "installDate") {
            va = new Date(a.install_date || 0).getTime();
            vb = new Date(b.install_date || 0).getTime();
        } else if (sortBy === "meterSerialNumber") {
            va = String(a.meter_serial_number || "").toLowerCase();
            vb = String(b.meter_serial_number || "").toLowerCase();
        } else {
            // connectionId
            va = Number(a.connection_id || 0);
            vb = Number(b.connection_id || 0);
        }

        if (va < vb) return sortOrder === "asc" ? -1 : 1;
        if (va > vb) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    renderConnections(list);
}


function renderConnections(connections) {
    const container = document.getElementById("recordsContainer");
    if (!container) return;

    if (!connections || connections.length === 0) {
        container.innerHTML = `<p class="empty-state">No connections found</p>`;
        return;
    }

    container.innerHTML = connections
        .map(
            (c) => `
      <div class="record-item">
        <div class="record-info">
          <div><strong>ID:</strong> ${c.connection_id}</div>
          <div><strong>Customer ID:</strong> ${c.customer_id}</div>
          <div><strong>Tariff ID:</strong> ${c.tariff_id}</div>
          <div><strong>Meter:</strong> ${c.meter_serial_number}</div>
          <div><strong>Utility:</strong> ${c.utility_type}</div>
          <div><strong>Status:</strong> ${c.status}</div>
          <div><strong>Installed:</strong> ${formatDate(c.install_date)}</div>
        </div>
        <div class="record-actions">
          <button class="btn btn-view" onclick="editConnection(${c.connection_id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteConnection(${c.connection_id})">Delete</button>
        </div>
      </div>
    `
        )
        .join("");
}


window.addRecord = function () {
    linkedConnectionId = null;
    openConnectionModal(null);
};


window.editConnection = async function (connectionId) {
    linkedConnectionId = connectionId;

    try {
        const res = await fetch(`/connections/${connectionId}`, { headers: authHeader() });
        if (!res.ok) throw new Error("Failed to fetch connection");

        const connection = await res.json();
        openConnectionModal(connection);
    } catch (err) {
        console.error(err);
        showToast("Error loading connection", "error");
    }
};


function openConnectionModal(connection = null) {
    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("recordModal");
    if (!overlay || !modal) return;

    modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-left">
        <h3>${connection ? "Edit Utility Connection" : "Add New Utility Connection"}</h3>
      </div>
      <div class="modal-header-right">
        <button class="close-btn" onclick="closeModal()">✕</button>
      </div>
    </div>

    <div class="modal-body">
      <div class="detail-grid-top">
        <div>
          <div class="info-box">
            <h4>How connection creation works</h4>
            <ul>
              <li><strong>Meter Serial</strong> must be unique.</li>
              <li><strong>Customer ID</strong> and <strong>Tariff ID</strong> must exist.</li>
              <li><strong>Install Date</strong> is required.</li>
            </ul>
          </div>
        </div>

        <div>
          <div class="detail-item">
            <span class="detail-label">Meter Serial Number</span>
            <input class="detail-value detail-input" id="meter_serial_number"
              placeholder="e.g. ELX-9001"
              value="${connection?.meter_serial_number || ""}">
          </div>

          <div class="detail-item">
            <span class="detail-label">Utility Type</span>
            <select class="detail-value detail-input" id="utility_type">
              <option value="ELECTRICITY" ${connection?.utility_type === "ELECTRICITY" ? "selected" : ""}>ELECTRICITY</option>
              <option value="WATER" ${connection?.utility_type === "WATER" ? "selected" : ""}>WATER</option>
              <option value="GAS" ${connection?.utility_type === "GAS" ? "selected" : ""}>GAS</option>
            </select>
          </div>

          <div class="detail-item">
            <span class="detail-label">Installation Date</span>
            <input class="detail-value detail-input" type="date" id="install_date"
              value="${toDateInputValue(connection?.install_date)}">
          </div>
        </div>

        <div>
          <div class="detail-item">
            <span class="detail-label">Customer ID</span>
            <input class="detail-value detail-input" id="customer_id"
              placeholder="e.g. 12"
              value="${connection?.customer_id ?? ""}">
          </div>

          <div class="detail-item">
            <span class="detail-label">Tariff ID</span>
            <input class="detail-value detail-input" id="tariff_id"
              placeholder="e.g. 1"
              value="${connection?.tariff_id ?? ""}">
          </div>

          <div class="detail-item">
            <span class="detail-label">Status</span>
            <select class="detail-value detail-input" id="status">
              <option value="ACTIVE" ${connection?.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
              <option value="INACTIVE" ${connection?.status === "INACTIVE" ? "selected" : ""}>INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      <div class="detail-grid-bottom" style="margin-top: 18px;">
        <button class="btn-adv btn-save" onclick="saveConnection()">Save</button>
      </div>
    </div>
  `;

    modal.classList.add("active");
    overlay.classList.add("active");
}


window.saveConnection = async function () {
    const meter_serial_number = document.getElementById("meter_serial_number")?.value.trim();
    const utility_type = document.getElementById("utility_type")?.value;
    const install_date = document.getElementById("install_date")?.value; // yyyy-mm-dd
    const customer_id = parseInt(document.getElementById("customer_id")?.value, 10);
    const tariff_id = parseInt(document.getElementById("tariff_id")?.value, 10);
    const status = document.getElementById("status")?.value;

    if (!meter_serial_number || !utility_type || !install_date || !customer_id || !tariff_id || !status) {
        showToast("Please fill all required fields", "error");
        return;
    }

    const payload = {
        meter_serial_number,
        utility_type,
        // convert date to ISO (midnight UTC)
        install_date: new Date(install_date + "T00:00:00Z").toISOString(),
        customer_id,
        tariff_id,
        status
    };

    const url = linkedConnectionId ? `/connections/${linkedConnectionId}` : "/connections";
    const method = linkedConnectionId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let msg = "Failed to save connection";
            try {
                const err = await res.json();
                msg = err.message || msg;
            } catch (_) {}
            showToast(msg, "error");
            return;
        }

        showToast(linkedConnectionId ? "Connection updated" : "Connection created", "success");
        closeModal();
        await fetchConnections();
    } catch (err) {
        console.error(err);
        showToast("Server error while saving connection", "error");
    }
};


window.deleteConnection = async function (connectionId) {
    if (!confirm("Are you sure you want to delete this connection?")) return;

    try {
        const res = await fetch(`/connections/${connectionId}`, {
            method: "DELETE",
            headers: authHeader(),
        });

        if (!res.ok) throw new Error("Failed to delete connection");

        showToast("Connection deleted", "success");
        fetchConnections();
    } catch (err) {
        console.error(err);
        showToast("Error deleting connection", "error");
    }
};


window.closeModal = function () {
    document.getElementById("recordModal")?.classList.remove("active");
    document.getElementById("modalOverlay")?.classList.remove("active");
};
