let linkedTariffId = null;
let allTariffs = [];

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", applyTariffFilters);
    fetchTariffs();
});

function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function safeFloat(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
}

function safeInt(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
}

window.fetchTariffs = async function fetchTariffs() {
    try {
        const res = await fetch("/tariffs", { headers: authHeader() });
        if (!res.ok) throw new Error("Failed to fetch tariffs");

        allTariffs = await res.json();
        applyTariffFilters();
    } catch (err) {
        console.error(err);
        showToast("Error loading tariffs", "error");
    }
};

window.refreshAudits = function () {
    window.fetchTariffs();
};

function applyTariffFilters() {
    const searchValue = (document.getElementById("searchInput")?.value || "")
        .trim()
        .toLowerCase();

    const statusFilter = document.getElementById("filterStatus")?.value || "all";
    const utilityFilter = document.getElementById("filterUtilityType")?.value || "all";

    const sortBy = document.getElementById("sortBySelect")?.value || "tariffId";
    const sortOrder = document.getElementById("sortOrderSelect")?.value || "asc";

    let tariffs = Array.isArray(allTariffs) ? [...allTariffs] : [];

    if (searchValue) {
        tariffs = tariffs.filter((t) =>
            String(t.tariff_name || "").toLowerCase().includes(searchValue)
        );
    }

    if (statusFilter !== "all") {
        tariffs = tariffs.filter((t) => String(t.status) === statusFilter);
    }

    if (utilityFilter !== "all") {
        tariffs = tariffs.filter((t) => String(t.utility_type) === utilityFilter);
    }

    tariffs.sort((a, b) => {
        let va, vb;

        if (sortBy === "tariffName") {
            va = String(a.tariff_name || "").toLowerCase();
            vb = String(b.tariff_name || "").toLowerCase();
        } else if (sortBy === "fixedCharge") {
            va = Number(a.fixed_charge || 0);
            vb = Number(b.fixed_charge || 0);
        } else {
            va = Number(a.tariff_id || 0);
            vb = Number(b.tariff_id || 0);
        }

        if (va < vb) return sortOrder === "asc" ? -1 : 1;
        if (va > vb) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    renderTariffs(tariffs);
}

function renderTariffs(tariffs) {
    const container = document.getElementById("recordsContainer");
    if (!container) return;

    if (!tariffs || tariffs.length === 0) {
        container.innerHTML = `<p class="empty-state">No tariffs found</p>`;
        return;
    }

    container.innerHTML = tariffs
        .map(
            (t) => `
      <div class="record-item">
        <div class="record-info">
          <div class="record-id">ID: ${t.tariff_id}</div>
          <div class="record-name">${t.tariff_name}</div>
          <div class="record-meta">
            Utility: ${t.utility_type} • Status: ${t.status} • Prorated: ${t.is_prorated ? "Yes" : "No"}
          </div>
          <div class="record-meta">
            Fixed: ${t.fixed_charge} • Tax: ${t.tax_percentage}%
          </div>
        </div>
        <div class="record-actions">
          <button class="btn btn-view" onclick="editTariff(${t.tariff_id})">Edit</button>
        </div>
      </div>
    `
        )
        .join("");
}

window.addRecord = function () {
    linkedTariffId = null;
    openTariffModal("Add New Tariff", null);
};

function openTariffModal(title, tariff) {
    const modal = document.getElementById("recordModal");
    const overlay = document.getElementById("modalOverlay");
    if (!modal || !overlay) return;

    modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-left"><h3>${title}</h3></div>
      <div class="modal-header-right">
        <button class="close-btn" onclick="closeModal()">✕</button>
      </div>
    </div>

    <div class="modal-body">
      <div class="detail-grid-top">
        <div>
          <div class="info-box">
            <h4>Tariff setup</h4>
            <ul>
              <li><strong>Slabs</strong> define rates by unit ranges.</li>
              <li>Leave <strong>End Unit</strong> blank for last slab (∞).</li>
            </ul>
          </div>
        </div>

        <div>
          <div class="detail-item">
            <span class="detail-label">Tariff Name</span>
            <input class="detail-value detail-input" id="tariff_name" placeholder="e.g. Domestic Standard">
          </div>
          <div class="detail-item">
            <span class="detail-label">Utility Type</span>
            <select class="detail-value detail-input" id="utility_type">
              <option value="ELECTRICITY">ELECTRICITY</option>
              <option value="WATER">WATER</option>
              <option value="GAS">GAS</option>
            </select>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fixed Charge</span>
            <input class="detail-value detail-input" id="fixed_charge" type="number" step="0.01">
          </div>
        </div>

        <div>
          <div class="detail-item">
            <span class="detail-label">Tax Percentage (%)</span>
            <input class="detail-value detail-input" id="tax_percentage" type="number" step="0.01">
          </div>
          <div class="detail-item" style="display:flex;align-items:center;gap:10px;padding-top:10px;">
            <span class="detail-label">Prorated Billing</span>
            <input type="checkbox" id="is_prorated" style="width:18px;height:18px;">
          </div>
          <div class="detail-item" style="margin-top:10px;">
            <span class="detail-label">Status</span>
            <select class="detail-value detail-input" id="status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      <div class="detail-grid-middle">
        <div class="detail-item" style="grid-column:1 / -1;">
          <span class="detail-label">Tariff Description</span>
          <textarea class="detail-value detail-input" id="tariff_description" rows="2"
            style="width:100%; border:1px solid var(--border-color); border-radius:4px; padding:8px;"></textarea>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0;">Slabs</h4>
          <button class="btn btn-view" type="button" onclick="addSlabRow()">+ Add Slab</button>
        </div>

        <div style="margin-top:10px; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
          <div style="display:grid; grid-template-columns:90px 1fr 1fr 1fr 60px; gap:10px; font-size:12px; opacity:.8; margin-bottom:6px;">
            <div>Order</div><div>Start</div><div>End</div><div>Rate</div><div></div>
          </div>
          <div id="slabsContainer"></div>
          <p id="slabsEmpty" class="empty-state" style="margin:10px 0 0; display:none;">No slabs yet. Add at least one.</p>
        </div>
      </div>

      <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-secondary" type="button" onclick="closeModal()">Cancel</button>
        <button class="btn-adv btn-save" type="button" onclick="saveTariff()">Save</button>
      </div>
    </div>
  `;

    modal.classList.add("active");
    overlay.classList.add("active");

    if (tariff) {
        document.getElementById("tariff_name").value = tariff.tariff_name ?? "";
        document.getElementById("utility_type").value = tariff.utility_type ?? "ELECTRICITY";
        document.getElementById("fixed_charge").value = tariff.fixed_charge ?? "";
        document.getElementById("tax_percentage").value = tariff.tax_percentage ?? "";
        document.getElementById("is_prorated").checked = !!tariff.is_prorated;
        document.getElementById("tariff_description").value = tariff.tariff_description ?? "";
        document.getElementById("status").value = tariff.status ?? "ACTIVE";

        const slabs = Array.isArray(tariff.slabs) ? [...tariff.slabs] : [];
        slabs.sort((a, b) => (a.slab_order ?? 0) - (b.slab_order ?? 0));

        if (slabs.length) slabs.forEach((s) => addSlabRow(s));
        else addSlabRow();
    } else {
        document.getElementById("status").value = "ACTIVE";
        addSlabRow();
    }

    refreshSlabEmpty();
}

window.addSlabRow = function (slab = null) {
    const container = document.getElementById("slabsContainer");
    if (!container) return;

    const rowId = `slab_${Math.random().toString(16).slice(2)}`;

    const row = document.createElement("div");
    row.className = "slab-row";
    row.id = rowId;
    row.style.display = "grid";
    row.style.gridTemplateColumns = "90px 1fr 1fr 1fr 60px";
    row.style.gap = "10px";
    row.style.marginBottom = "10px";

    row.innerHTML = `
    <input class="detail-value detail-input slab-order" type="number" min="1" placeholder="1" value="${slab?.slab_order ?? ""}">
    <input class="detail-value detail-input slab-start" type="number" min="1" placeholder="1" value="${slab?.start_unit ?? ""}">
    <input class="detail-value detail-input slab-end" type="number" min="1" placeholder="(blank = ∞)" value="${slab?.end_unit ?? ""}">
    <input class="detail-value detail-input slab-rate" type="number" step="0.01" min="0" placeholder="7.00" value="${slab?.unit_rate ?? ""}">
    <button class="icon-btn" type="button" onclick="removeSlabRow('${rowId}')">✕</button>
  `;

    container.appendChild(row);
    refreshSlabEmpty();
};

window.removeSlabRow = function (rowId) {
    document.getElementById(rowId)?.remove();
    refreshSlabEmpty();
};

function refreshSlabEmpty() {
    const rows = document.querySelectorAll("#slabsContainer .slab-row");
    const empty = document.getElementById("slabsEmpty");
    if (empty) empty.style.display = rows.length ? "none" : "block";
}


window.editTariff = async function (tariffId) {
    linkedTariffId = tariffId;

    try {
        const res = await fetch(`/tariffs/${tariffId}`, { headers: authHeader() });
        if (!res.ok) throw new Error("Failed to fetch tariff");

        const t = await res.json();
        openTariffModal("Edit Tariff", t);
    } catch (err) {
        console.error(err);
        showToast("Error fetching tariff data", "error");
    }
};

window.saveTariff = async function () {
    const tariffName = document.getElementById("tariff_name")?.value.trim();
    const utilityType = document.getElementById("utility_type")?.value;
    const fixedCharge = safeFloat(document.getElementById("fixed_charge")?.value);
    const taxPercentage = safeFloat(document.getElementById("tax_percentage")?.value);
    const isProrated = !!document.getElementById("is_prorated")?.checked;
    const description = document.getElementById("tariff_description")?.value.trim();
    const status = document.getElementById("status")?.value || "ACTIVE";

    if (!tariffName || fixedCharge === null || taxPercentage === null) {
        showToast("Please fill all required fields correctly", "error");
        return;
    }

    const rows = Array.from(document.querySelectorAll("#slabsContainer .slab-row"));
    if (rows.length === 0) {
        showToast("Please add at least one slab", "error");
        return;
    }

    const slabs = [];
    for (const r of rows) {
        const slabOrder = safeInt(r.querySelector(".slab-order")?.value);
        const startUnit = safeInt(r.querySelector(".slab-start")?.value);
        const endRaw = (r.querySelector(".slab-end")?.value ?? "").trim();
        const endUnit = endRaw === "" ? null : safeInt(endRaw);
        const unitRate = safeFloat(r.querySelector(".slab-rate")?.value);

        if (!slabOrder || !startUnit || unitRate === null) {
            showToast("Each slab needs Order, Start Unit, and Unit Rate", "error");
            return;
        }
        if (endUnit !== null && endUnit < startUnit) {
            showToast("End Unit must be >= Start Unit (or blank)", "error");
            return;
        }

        slabs.push({
            slab_order: slabOrder,
            start_unit: startUnit,
            end_unit: endUnit,
            unit_rate: unitRate,
        });
    }

    slabs.sort((a, b) => a.slab_order - b.slab_order);

    const payload = {
        tariff_name: tariffName,
        utility_type: utilityType,
        fixed_charge: fixedCharge,
        tax_percentage: taxPercentage,
        is_prorated: isProrated,
        tariff_description: description,
        status,
        slabs,
    };

    const url = linkedTariffId ? `/tariffs/${linkedTariffId}` : "/tariffs";
    const method = linkedTariffId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let msg = "Failed to save tariff";
            try {
                const err = await res.json();
                msg = err.message || msg;
            } catch (_) {}
            showToast(msg, "error");
            return;
        }

        showToast(linkedTariffId ? "Tariff updated successfully" : "Tariff created successfully", "success");
        closeModal();
        window.fetchTariffs();
    } catch (err) {
        console.error(err);
        showToast("Server error while saving tariff", "error");
    }
};

window.closeModal = function () {
    document.getElementById("recordModal")?.classList.remove("active");
    document.getElementById("modalOverlay")?.classList.remove("active");
};