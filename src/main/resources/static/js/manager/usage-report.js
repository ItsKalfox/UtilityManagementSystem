(function authGuard() {
    const token = localStorage.getItem("token");
    if (!token) window.location.replace("../index.html");
})();

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");


    const kpiIncome = document.getElementById("kpiIncome");
    const kpiCustomers = document.getElementById("kpiCustomers");
    const kpiConnections = document.getElementById("kpiConnections");


    const utilityContainer = document.getElementById("utilityContainer");
    const reloadBtn = document.getElementById("reloadBtn");


    const modal = document.getElementById("recordModal");
    const overlay = document.getElementById("modalOverlay");


    function escapeHtml(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function money(n) {
        const v = Number(n ?? 0);
        return v.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function headerRow() {
        return utilityContainer.querySelector(".record-item");
    }

    function resetRowsKeepHeader() {
        const header = headerRow();
        utilityContainer.innerHTML = "";
        if (header) utilityContainer.appendChild(header);
    }

    function renderMessage(text) {
        utilityContainer.insertAdjacentHTML(
            "beforeend",
            `<p class="muted" style="padding:10px 0;">${escapeHtml(text)}</p>`
        );
    }

    function badge(income) {
        const x = Number(income ?? 0);
        if (x > 0) return `<span class="status-badge status-active">Active</span>`;
        return `<span class="status-badge status-inactive">No Income</span>`;
    }


    function openModal(html) {
        if (!modal || !overlay) return;

        modal.innerHTML = html;
        modal.classList.add("active");
        overlay.classList.add("active");


        const closeBtn = modal.querySelector("[data-close='true']");
        if (closeBtn) closeBtn.addEventListener("click", closeModal);

        overlay.addEventListener("click", closeModal, { once: true });

        document.addEventListener("keydown", onEscClose);
    }

    function onEscClose(e) {
        if (e.key === "Escape") closeModal();
    }

    function closeModal() {
        if (!modal || !overlay) return;
        modal.classList.remove("active");
        overlay.classList.remove("active");
        modal.innerHTML = "";
        document.removeEventListener("keydown", onEscClose);
    }


    async function loadSummary() {
        // If you already have an endpoint, set it here:
        // GET /api/manager/usage/summary  -> { totalIncome, totalCustomers, totalConnections }
        const url = "/api/manager/usage/summary";

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`Summary API failed: ${res.status}`);

            const d = await res.json();
            if (kpiIncome) kpiIncome.textContent = `Rs. ${money(d.totalIncome)}`;
            if (kpiCustomers) kpiCustomers.textContent = String(d.totalCustomers ?? 0);
            if (kpiConnections) kpiConnections.textContent = String(d.totalConnections ?? 0);
        } catch (e) {

            if (kpiIncome) kpiIncome.textContent = "Rs. 0.00";
            if (kpiCustomers) kpiCustomers.textContent = "0";
            if (kpiConnections) kpiConnections.textContent = "0";
            console.warn("Summary endpoint not ready or failed:", e.message);
        }
    }

    async function loadUtilities() {

        const url = "/api/manager/usage/utilities";

        resetRowsKeepHeader();
        renderMessage("Loading utilities...");

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            resetRowsKeepHeader();

            if (!res.ok) {
                renderMessage(`Failed to load utilities (status ${res.status}).`);
                return;
            }

            const items = await res.json();

            if (!Array.isArray(items) || items.length === 0) {
                renderMessage("No utility data found.");
                return;
            }

            utilityContainer.insertAdjacentHTML(
                "beforeend",
                items
                    .map((u) => {
                        const type = String(u.utilityType ?? "");
                        return `
              <div class="record-item">
                <div class="record-info">
                  <span class="record-name">${escapeHtml(type)}</span>
                  <span class="record-name">${money(u.income)}</span>
                  <span class="record-name">${escapeHtml(u.customers ?? 0)}</span>
                  <span class="record-name">${escapeHtml(u.connections ?? 0)}</span>
                  ${badge(u.income)}
                </div>
                <div class="record-actions">
                  <button
                    class="btn btn-view btn-income"
                    type="button"
                    data-type="${escapeHtml(type)}"
                  >
                    View Income Sources
                  </button>
                </div>
              </div>
            `;
                    })
                    .join("")
            );
        } catch (e) {
            resetRowsKeepHeader();
            renderMessage("Server error while loading utilities.");
            console.error(e);
        }
    }

    async function loadIncomeSourcesForUtility(utilityType) {

        const safeType = encodeURIComponent(utilityType);
        const url = `/api/manager/usage/utilities/${safeType}/incomes`;

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                return { ok: false, message: `Detail API failed (status ${res.status})` };
            }

            const data = await res.json();
            return { ok: true, data };
        } catch (e) {
            return { ok: false, message: "Network/server error while loading detail report." };
        }
    }

    function openIncomeSourcesModal(type) {
        openModal(`
      <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <h3 style="margin:0;">${escapeHtml(type)} - Income Sources</h3>
        <button class="icon-btn" type="button" data-close="true" aria-label="Close">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <p class="muted" id="incomeHint">Loading report...</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
          <button class="btn btn-secondary" type="button" id="printBtn">Print Report</button>
          <button class="btn btn-secondary" type="button" id="refreshDetailBtn">Reload</button>
        </div>

        <div class="records-container" id="incomeTable" style="margin-top:12px;">
          <div class="record-item" style="background: var(--gray-100); font-weight: 600;">
            <div class="record-info">
              <span style="color: var(--text-primary)">Customer</span>
              <span style="color: var(--text-primary)">Bills Paid</span>
              <span style="color: var(--text-primary)">Total Paid (Rs.)</span>
            </div>
            <div class="record-actions">Action</div>
          </div>
         
        </div>
      </div>
    `);


        const printBtn = modal.querySelector("#printBtn");
        const refreshBtn = modal.querySelector("#refreshDetailBtn");
        const hint = modal.querySelector("#incomeHint");
        const incomeTable = modal.querySelector("#incomeTable");

        const renderDetailMessage = (msg) => {
            if (hint) hint.textContent = msg;
        };

        const renderRows = (rows) => {

            const header = incomeTable.querySelector(".record-item");
            incomeTable.innerHTML = "";
            if (header) incomeTable.appendChild(header);

            if (!rows || rows.length === 0) {
                incomeTable.insertAdjacentHTML(
                    "beforeend",
                    `<p class="muted" style="padding:10px 0;">No income records found.</p>`
                );
                return;
            }

            incomeTable.insertAdjacentHTML(
                "beforeend",
                rows
                    .map((r) => {
                        return `
              <div class="record-item">
                <div class="record-info">
                  <span class="record-name">${escapeHtml(r.fullName ?? "-")}</span>
                  <span class="record-name">${escapeHtml(r.billsPaidCount ?? 0)}</span>
                  <span class="record-name">${money(r.totalPaid)}</span>
                </div>
                <div class="record-actions">
                  <button class="btn btn-view" type="button" disabled>View</button>
                </div>
              </div>
            `;
                    })
                    .join("")
            );
        };

        async function loadDetail() {
            renderDetailMessage("Loading report...");
            const result = await loadIncomeSourcesForUtility(type);

            if (!result.ok) {
                renderDetailMessage(result.message + " (Create endpoint later)");
                renderRows([]);
                return;
            }

            renderDetailMessage("Report loaded.");
            renderRows(Array.isArray(result.data) ? result.data : []);
        }

        if (refreshBtn) refreshBtn.addEventListener("click", loadDetail);

        if (printBtn) {
            printBtn.addEventListener("click", () => {
                // Simple print of current modal content
                const w = window.open("", "_blank");
                if (!w) return;
                w.document.write(`
          <html><head><title>Print Report</title></head>
          <body>
            <h2>${escapeHtml(type)} - Income Sources</h2>
            ${incomeTable ? incomeTable.outerHTML : ""}
          </body></html>
        `);
                w.document.close();
                w.focus();
                w.print();
            });
        }

        loadDetail();
    }


    utilityContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-income");
        if (!btn) return;

        const type = btn.getAttribute("data-type");
        if (!type) return;

        openIncomeSourcesModal(type);
    });


    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
            loadSummary();
            loadUtilities();
        });
    }


    loadSummary();
    loadUtilities();
});
