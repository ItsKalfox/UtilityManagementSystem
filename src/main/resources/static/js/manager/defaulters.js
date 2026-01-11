document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const fullName = localStorage.getItem("fullName") || "Manager";
    const email = localStorage.getItem("email") || "manager@ums.com";
    const fullNameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const avatarEl = document.getElementById("userAvatar");
    if (fullNameEl) fullNameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = String(fullName).charAt(0).toUpperCase();

    const recordsContainer = document.getElementById("recordsContainer");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const reloadBtn = document.getElementById("reloadBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");

    const size = 10;
    let page = 0;
    let allRows = [];

    function headerRow() {
        return recordsContainer.querySelector(".record-item");
    }

    function resetRowsKeepHeader() {
        const header = headerRow();
        recordsContainer.innerHTML = "";
        if (header) recordsContainer.appendChild(header);
    }

    function renderMessage(msg) {
        recordsContainer.insertAdjacentHTML(
            "beforeend",
            `<p class="muted" style="padding:10px 0;">${escapeHtml(msg)}</p>`
        );
    }

    function badgeForCustomerStatus(status) {
        const s = String(status || "").toUpperCase();
        if (s === "ACTIVE") return `<span class="status-badge status-active">ACTIVE</span>`;
        return `<span class="status-badge status-inactive">${escapeHtml(s || "INACTIVE")}</span>`;
    }

    function formatMoney(n) {
        return Number(n || 0).toFixed(2);
    }

    function openModal(html) {
        const overlay = document.getElementById("modalOverlay");
        const modal = document.getElementById("recordModal");
        overlay.style.display = "block";
        modal.style.display = "block";
        modal.innerHTML = html;

        overlay.onclick = closeModal;
        const closeBtn = modal.querySelector("[data-close]");
        if (closeBtn) closeBtn.onclick = closeModal;
    }

    function closeModal() {
        const overlay = document.getElementById("modalOverlay");
        const modal = document.getElementById("recordModal");
        overlay.style.display = "none";
        modal.style.display = "none";
        modal.innerHTML = "";
    }

    async function fetchDefaulters() {
        resetRowsKeepHeader();
        renderMessage("Loading defaulters...");

        try {
            const res = await fetch("/api/manager/defaulters", {
                headers: { Authorization: `Bearer ${token}` }
            });

            resetRowsKeepHeader();

            if (!res.ok) {
                renderMessage(`Failed to load defaulters (status ${res.status}).`);
                return;
            }

            const data = await res.json();
            allRows = Array.isArray(data) ? data : [];
            page = 0;
            renderCurrentPage();
        } catch (e) {
            console.error(e);
            resetRowsKeepHeader();
            renderMessage("Server error while loading defaulters.");
        }
    }

    function applySearchAndSort(rows) {
        const q = (searchInput.value || "").trim().toLowerCase();
        let filtered = rows;

        if (q) {
            filtered = rows.filter(r => {
                const id = String(r.customerId ?? "").toLowerCase();
                const name = String(r.fullName ?? "").toLowerCase();
                const area = String(r.areaName ?? "").toLowerCase();
                return id.includes(q) || name.includes(q) || area.includes(q);
            });
        }

        const sort = sortSelect.value;
        filtered.sort((a, b) => {
            const aAmt = Number(a.totalOutstanding || 0);
            const bAmt = Number(b.totalOutstanding || 0);

            if (sort === "amountAsc") return aAmt - bAmt;
            if (sort === "nameAsc") return String(a.fullName || "").localeCompare(String(b.fullName || ""));
            return bAmt - aAmt;
        });

        return filtered;
    }

    function renderCurrentPage() {
        resetRowsKeepHeader();

        const filtered = applySearchAndSort(allRows);
        const totalPages = Math.max(1, Math.ceil(filtered.length / size));
        const currentPage = Math.min(page, totalPages - 1);

        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        prevBtn.disabled = currentPage <= 0;
        nextBtn.disabled = currentPage >= totalPages - 1;

        const slice = filtered.slice(currentPage * size, currentPage * size + size);

        if (slice.length === 0) {
            renderMessage("No defaulters found.");
            return;
        }

        recordsContainer.insertAdjacentHTML(
            "beforeend",
            slice.map(r => {
                return `
          <div class="record-item">
            <div class="record-info">
              <span class="record-id">#${escapeHtml(r.customerId)}</span>
              <span class="record-name">${escapeHtml(r.fullName || "-")}</span>
              <span class="record-department">${escapeHtml(r.areaName || "-")}</span>
              <span class="record-name">${formatMoney(r.totalOutstanding)}</span>
              <span class="status-badge status-inactive">OUTSTANDING</span>
            </div>
            <div class="record-actions">
              <button class="btn btn-view" type="button" data-id="${escapeHtml(r.customerId)}">
                View Detail
              </button>
            </div>
          </div>
        `;
            }).join("")
        );

        recordsContainer.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", () => openDetails(btn.getAttribute("data-id")));
        });
    }

    async function openDetails(customerId) {
        openModal(`
      <div class="modal-header">
        <h3>Loading...</h3>
        <button class="icon-btn" data-close type="button">✕</button>
      </div>
      <div class="modal-body">
        <p class="muted">Fetching customer + bills + payments...</p>
      </div>
    `);

        try {
            const res = await fetch(`/api/manager/defaulters/${encodeURIComponent(customerId)}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                openModal(`
          <div class="modal-header">
            <h3>Error</h3>
            <button class="icon-btn" data-close type="button">✕</button>
          </div>
          <div class="modal-body">
            <p class="muted">Failed to load details (status ${res.status}).</p>
            <div style="display:flex;justify-content:flex-end;margin-top:14px;">
              <button class="btn btn-secondary" data-close type="button">Close</button>
            </div>
          </div>
        `);
                return;
            }

            const d = await res.json();

            const customerBlock = `
        <div style="padding:10px;border:1px solid var(--gray-200);border-radius:12px;">
          <p><b>ID:</b> #${escapeHtml(d.customerId)}</p>
          <p><b>Name:</b> ${escapeHtml(d.fullName || "-")}</p>
          <p><b>Email:</b> ${escapeHtml(d.email || "-")}</p>
          <p><b>NIC:</b> ${escapeHtml(d.nic || "-")}</p>
          <p><b>Type:</b> ${escapeHtml(d.customerType || "-")}</p>
          <p><b>Area:</b> ${escapeHtml(d.areaName || "-")} (${escapeHtml(d.areaCode || "-")})</p>
          <p><b>Status:</b> ${badgeForCustomerStatus(d.status)}</p>
          <p><b>Address:</b> ${escapeHtml(d.addressLine1 || "")} ${escapeHtml(d.addressLine2 || "")},
            ${escapeHtml(d.addressCity || "")} ${escapeHtml(d.addressPostalCode || "")}
          </p>
        </div>
      `;
            const billsBlock = renderBills(d.bills || []);

            openModal(`
        <div class="modal-header">
          <h3>Defaulter Details</h3>
          <button class="icon-btn" data-close type="button">✕</button>
        </div>
        <div class="modal-body">

          ${customerBlock}

          <div style="margin-top:12px;padding:10px;border:1px solid var(--gray-200);border-radius:12px;">
            <h4 style="margin:0 0 10px;">Change Customer Status</h4>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <select id="statusSelect" class="sort-select" style="min-width:200px;">
                <option value="ACTIVE" ${String(d.status).toUpperCase()==="ACTIVE" ? "selected" : ""}>ACTIVE</option>
                <option value="INACTIVE" ${String(d.status).toUpperCase()==="INACTIVE" ? "selected" : ""}>INACTIVE</option>
              </select>
              <button class="btn btn-secondary" id="saveStatusBtn" type="button">Save</button>
              <span class="muted" id="statusMsg"></span>
            </div>
          </div>

          <div style="margin-top:14px;">
            <h3 style="margin-bottom:8px;">Bills & Payments History</h3>
            ${billsBlock}
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
            <button class="btn btn-secondary" data-close type="button">Close</button>
          </div>

        </div>
      `);
            const saveBtn = document.getElementById("saveStatusBtn");
            const statusSelect = document.getElementById("statusSelect");
            const statusMsg = document.getElementById("statusMsg");

            saveBtn.addEventListener("click", async () => {
                statusMsg.textContent = "Saving...";
                const newStatus = statusSelect.value;

                const r = await fetch(`/api/manager/customers/${encodeURIComponent(d.customerId)}/status`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!r.ok) {
                    statusMsg.textContent = `Failed (${r.status})`;
                    return;
                }

                statusMsg.textContent = "Saved ✅";


                setTimeout(() => openDetails(d.customerId), 350);
            });

        } catch (e) {
            console.error(e);
        }
    }

    function renderBills(bills) {
        if (!bills || bills.length === 0) {
            return `<p class="muted">No bills found.</p>`;
        }

        return bills.map(b => {
            const payments = b.payments || [];

            const paymentsHtml = payments.length
                ? `
          <div style="margin-top:8px;">
            <div class="record-item" style="background: var(--gray-100); font-weight: 600;">
              <div class="record-info">
                <span style="color: var(--text-primary)">Payment ID</span>
                <span style="color: var(--text-primary)">Method</span>
                <span style="color: var(--text-primary)">Amount (Rs.)</span>
                <span style="color: var(--text-primary)">Date</span>
                <span style="color: var(--text-primary)">Cashier</span>
              </div>
            </div>

            ${payments.map(p => `
              <div class="record-item">
                <div class="record-info">
                  <span class="record-id">#${escapeHtml(p.paymentId)}</span>
                  <span class="record-name">${escapeHtml(p.paymentMethod || "-")}</span>
                  <span class="record-name">${formatMoney(p.amount)}</span>
                  <span class="record-name">${escapeHtml(p.paymentDate || "-")}</span>
                  <span class="record-name">${escapeHtml(p.cashierId ?? "-")}</span>
                </div>
              </div>
            `).join("")}
          </div>
        `
                : `<p class="muted" style="margin-top:8px;">No payments found for this bill.</p>`;

            return `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--gray-200);">
          <h4 style="margin-bottom:6px;">
            Bill #${escapeHtml(b.billId)} (${escapeHtml(b.utilityType || "-")})
          </h4>

          <p class="muted" style="margin:0;">
            Period: ${escapeHtml(b.periodStart || "-")} → ${escapeHtml(b.periodEnd || "-")}
          </p>

          <p style="margin:6px 0 0;">
            <b>Total:</b> Rs. ${formatMoney(b.totalBillAmount)}
            &nbsp; | &nbsp;
            <b>Outstanding:</b> Rs. ${formatMoney(b.outstandingAmount)}
            &nbsp; | &nbsp;
            <b>Status:</b> ${escapeHtml(b.status || "-")}
          </p>

          ${paymentsHtml}
        </div>
      `;
        }).join("");
    }

    reloadBtn.addEventListener("click", fetchDefaulters);

    let debounceTimer = null;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            page = 0;
            renderCurrentPage();
        }, 250);
    });

    sortSelect.addEventListener("change", () => {
        page = 0;
        renderCurrentPage();
    });

    prevBtn.addEventListener("click", () => {
        if (page > 0) page--;
        renderCurrentPage();
    });

    nextBtn.addEventListener("click", () => {
        page++;
        renderCurrentPage();
    });

    fetchDefaulters();
});

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}