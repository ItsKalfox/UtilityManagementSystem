

document.addEventListener("DOMContentLoaded", async () => {
    await fetchPermissions();
    await fetchRoles();

    const searchInput = document.getElementById("searchInput");
    const sortBySelect = document.getElementById("sortBySelect");
    const sortOrderSelect = document.getElementById("sortOrderSelect");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (sortBySelect) sortBySelect.addEventListener("change", applyFilters);
    if (sortOrderSelect) sortOrderSelect.addEventListener("change", applyFilters);
});

let allPermissions = [];
let allRoles = [];
let linkedRoleId = null;


function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}


async function fetchRoles() {
    try {
        const response = await fetch("/roles", { headers: authHeader() });

        if (!response.ok) {
            showToast("Failed to fetch roles", "error");
            return;
        }

        allRoles = await response.json();
        applyFilters();
    } catch (err) {
        console.error(err);
        showToast("Error loading roles", "error");
    }
}


async function fetchPermissions() {
    try {
        const response = await fetch("/permissions", { headers: authHeader() });

        if (!response.ok) {
            showToast("Failed to load permissions", "error");
            return;
        }

        allPermissions = await response.json();
    } catch (err) {
        console.error(err);
        showToast("Error fetching permissions", "error");
    }
}


function applyFilters() {
    const searchValue = (document.getElementById("searchInput")?.value || "")
        .trim()
        .toLowerCase();

    const sortBy = document.getElementById("sortBySelect")?.value || "roleId";
    const sortOrder = document.getElementById("sortOrderSelect")?.value || "asc";

    let roles = Array.isArray(allRoles) ? [...allRoles] : [];

    if (searchValue) {
        roles = roles.filter((r) =>
            String(r.role_name || "").toLowerCase().includes(searchValue)
        );
    }

    roles.sort((a, b) => {
        let va, vb;

        if (sortBy === "roleName") {
            va = String(a.role_name || "").toLowerCase();
            vb = String(b.role_name || "").toLowerCase();
        } else {
            va = Number(a.role_id || 0);
            vb = Number(b.role_id || 0);
        }

        if (va < vb) return sortOrder === "asc" ? -1 : 1;
        if (va > vb) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    renderRoles(roles);
}


function renderRoles(roles) {
    const container = document.getElementById("recordsContainer");

    if (!container) return;

    if (!roles || roles.length === 0) {
        container.innerHTML = `<p class="empty-state">No roles found</p>`;
        return;
    }

    container.innerHTML = roles
        .map(
            (role) => `
      <div class="record-item">
        <div class="record-info">
          <div class="record-id">ID: ${role.role_id}</div>
          <div class="record-name">${role.role_name}</div>
        </div>
        <div class="record-actions">
          <button class="btn btn-view" onclick="editRole(${role.role_id})">Edit</button>
        </div>
      </div>
    `
        )
        .join("");
}


window.addRecord = function () {
    linkedRoleId = null;
    openRoleModal("Add New System Role");
};

window.refreshAudits = function () {
    fetchRoles();
};


window.editRole = async function (roleId) {
    linkedRoleId = roleId;

    try {
        const response = await fetch(`/roles/${roleId}`, { headers: authHeader() });

        if (!response.ok) {
            showToast("Failed to load role", "error");
            return;
        }

        const role = await response.json();
        openRoleModal("Edit Role", role);
    } catch (err) {
        console.error(err);
        showToast("Error fetching role data", "error");
    }
};


function openRoleModal(title, role = null) {
    const modal = document.getElementById("recordModal");
    const overlay = document.getElementById("modalOverlay");
    if (!modal || !overlay) return;

    const checkedPermissions = role?.permission_ids || [];

    const permissionHTML =
        allPermissions && allPermissions.length
            ? allPermissions
                .map(
                    (p) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <input
              type="checkbox"
              class="perm-check"
              value="${p.permission_id}"
              id="perm${p.permission_id}"
              ${checkedPermissions.includes(p.permission_id) ? "checked" : ""}
              style="width:16px;height:16px;"
            >
            <label for="perm${p.permission_id}" style="font-size:13px; cursor:pointer;">
              ${p.permission_name}
            </label>
          </div>
        `
                )
                .join("")
            : `<p class="empty-state">No permissions loaded</p>`;

    modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-left">
        <h3>${title}</h3>
      </div>
      <div class="modal-header-right">
        <button class="close-btn" onclick="closeModal()">✕</button>
      </div>
    </div>

    <div class="modal-body">
      <div class="detail-grid-top">
        <div>
          <div class="info-box">
            <h4>How role creation works</h4>
            <ul>
              <li><strong>Role Name:</strong> must be unique.</li>
              <li><strong>Permissions:</strong> define access to pages/actions.</li>
            </ul>
          </div>
        </div>

        <div>
          <div class="detail-item">
            <span class="detail-label">Role Name</span>
            <input class="detail-value detail-input" id="role_name"
              placeholder="e.g. Finance Manager"
              value="${role ? role.role_name : ""}">
          </div>

          <div class="detail-item" style="margin-top: 20px;">
            <span class="detail-label">Assign Permissions</span>
            <div id="permissions_container"
              style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color);
                     border-radius: 4px; padding: 10px; margin-top: 5px;">
              ${permissionHTML}
            </div>
          </div>
        </div>
      </div>

      <div class="detail-grid-bottom" style="margin-top: 18px;">
        <button class="btn-adv btn-save" onclick="saveRole()">Save</button>
      </div>
    </div>
  `;

    modal.classList.add("active");
    overlay.classList.add("active");
}


window.saveRole = async function () {
    const roleName = document.getElementById("role_name")?.value.trim();

    if (!roleName) {
        showToast("Please enter role name", "error");
        return;
    }

    const selectedPermissions = Array.from(
        document.querySelectorAll(".perm-check:checked")
    ).map((cb) => parseInt(cb.value, 10));

    const payload = {
        role_name: roleName,
        permission_ids: selectedPermissions,
    };

    const url = linkedRoleId ? `/roles/${linkedRoleId}` : "/roles";
    const method = linkedRoleId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...authHeader(),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let msg = "Failed to save role";
            try {
                const err = await response.json();
                msg = err.message || msg;
            } catch (_) {}
            showToast(msg, "error");
            return;
        }

        showToast(linkedRoleId ? "Role updated" : "Role created", "success");
        closeModal();
        await fetchRoles();
    } catch (err) {
        console.error(err);
        showToast("Server error while saving role", "error");
    }
};


window.closeModal = function () {
    document.getElementById("recordModal")?.classList.remove("active");
    document.getElementById("modalOverlay")?.classList.remove("active");
};
