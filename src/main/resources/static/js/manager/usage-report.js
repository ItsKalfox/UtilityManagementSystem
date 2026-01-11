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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (typeof window.showConfirmModal === "function") {
                const result = await window.showConfirmModal({
                    title: "Logout",
                    message: "Are you sure you want to logout?",
                    confirmText: "Yes",
                    cancelText: "No",
                    danger: true,
                });

                if (!result || !result.confirmed) return;

                const theme = localStorage.getItem("theme");
                localStorage.clear();
                if (theme !== null) localStorage.setItem("theme", theme);

                window.location.replace("../index.html");
                return;
            }

            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("email");
                window.location.replace("../index.html");
            }
        });
    }

    const kpiIncome = document.getElementById("kpiIncome");
    const kpiCustomers = document.getElementById("kpiCustomers");
    const kpiConnections = document.getElementById("kpiConnections");

    const utilityContainer = document.getElementById("utilityContainer");
    const reloadBtn = document.getElementById("reloadBtn");

    function openModal(html) {
        const overlay = document.getElementById("modalOverlay");
        const modal = document.getElementById("recordModal");
        if (!overlay || !modal) return;

        overlay.style.display = "block";
        modal.style.display = "block";
        modal.innerHTML = html;

        modal.querySelectorAll("[data-close]").forEach((btn) => {
            btn.addEventListener("click", closeModal);
        });

        overlay.onclick = closeModal;
        modal.onclick = (e) => e.stopPropagation();
        document.addEventListener("keydown", onEsc);
    }

    function onEsc(e) {
        if (e.key === "Escape") closeModal();
    }

    function closeModal() {
        const overlay = document.getElementById("modalOverlay");
        const modal = document.getElementById("recordModal");
        if (!overlay || !modal) return;

        overlay.style.display = "none";
        modal.style.display = "none";
        modal.innerHTML = "";

        overlay.onclick = null;
        modal.onclick = null;

        document.removeEventListener("keydown", onEsc);
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

    function money(n) {
        return Number(n || 0).toFixed(2);
    }

    function badge(income) {
        const x = Number(income || 0);
        if (x > 0) return `<span class="status-badge status-active">Active</span>`;
        return `<span class="status-badge status-inactive">No Income</span>`;
    }

    async function loadSummary() {
        try {
            const res = await fetch("/api/manager/usage/summary", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("summary failed");
            const d = await res.json();

            if (kpiIncome) kpiIncome.textContent = `Rs. ${money(d.totalIncome)}`;
            if (kpiCustomers) kpiCustomers.textContent = String(d.totalCustomers ?? 0);
            if (kpiConnections) kpiConnections.textContent = String(d.totalConnections ?? 0);
        } catch (e) {
            if (kpiIncome) kpiIncome.textContent = "Rs. 0";
            if (kpiCustomers) kpiCustomers.textContent = "0";
            if (kpiConnections) kpiConnections.textContent = "0";
            console.warn("Summary endpoint not ready yet.", e);
        }
    }

    async function loadUtilities() {
        resetRowsKeepHeader();
        renderMessage("Loading utilities...");

        try {
            const res = await fetch("/api/manager/usage/utilities", {
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
                        const type = String(u.utilityType || "");
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
                  <button class="btn btn-view" type="button" data-type="${escapeHtml(type)}">
                    View Income Sources
                  </button>
                </div>
              </div>
            `;
                    })
                    .join("")
            );

            utilityContainer.querySelectorAll(".btn-view").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const type = btn.getAttribute("data-type");
                    openIncomeModal(type);
                });
            });
        } catch (e) {
            resetRowsKeepHeader();
            renderMessage("Server error while loading utilities.");
            console.error(e);
        }
    }

    function openIncomeModal(utilityType) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const defaultTo = `${yyyy}-${mm}-${dd}`;
        const defaultFrom = `${yyyy}-${mm}-01`;

        openModal(`
      <div class="modal-header">
        <h3>${escapeHtml(utilityType)} - Income Report</h3>
        <button class="icon-btn" data-close type="button">✕</button>
      </div>

      <div class="modal-body">
        <p class="muted">Select a time period and view income from customers.</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:10px;">
          <div style="min-width:180px;">
            <label class="muted">From</label>
            <input id="fromDate" type="date" value="${defaultFrom}"
              style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--gray-200);
              background:var(--card-bg);color:var(--text-primary);">
          </div>

          <div style="min-width:180px;">
            <label class="muted">To</label>
            <input id="toDate" type="date" value="${defaultTo}"
              style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--gray-200);
              background:var(--card-bg);color:var(--text-primary);">
          </div>

          <button class="btn btn-secondary" id="runBtn" type="button">Run Report</button>
          <button class="btn btn-secondary" id="printBtn" type="button">Print</button>
          <span class="muted" id="runMsg"></span>
        </div>

        <div style="margin-top:14px;padding:10px;border:1px solid var(--gray-200);border-radius:12px;">
          <h4 style="margin:0 0 6px;">Total Income</h4>
          <div style="font-size:22px;font-weight:700;" id="totalIncomeText">Rs. 0.00</div>
        </div>

        <div style="margin-top:14px;">
          <div class="records-container" id="incomeRows">
            <div class="record-item" style="background: var(--gray-100); font-weight: 600;">
              <div class="record-info">
                <span style="color: var(--text-primary)">Customer</span>
                <span style="color: var(--text-primary)">Connection</span>
                <span style="color: var(--text-primary)">Bills</span>
                <span style="color: var(--text-primary)">Billed</span>
                <span style="color: var(--text-primary)">Paid</span>
                <span style="color: var(--text-primary)">Outstanding</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
          <button class="btn btn-secondary" data-close type="button">Close</button>
        </div>
      </div>
    `);

        const runBtn = document.getElementById("runBtn");
        const printBtn = document.getElementById("printBtn");

        if (runBtn) runBtn.addEventListener("click", () => runIncomeReport(utilityType));
        if (printBtn) printBtn.addEventListener("click", () => printIncomeReport(utilityType));

        runIncomeReport(utilityType);
    }

    async function runIncomeReport(utilityType) {
        const fromEl = document.getElementById("fromDate");
        const toEl = document.getElementById("toDate");
        const runMsg = document.getElementById("runMsg");
        const totalIncomeText = document.getElementById("totalIncomeText");
        const incomeRows = document.getElementById("incomeRows");

        const from = fromEl ? fromEl.value : "";
        const to = toEl ? toEl.value : "";

        if (runMsg) runMsg.textContent = "Loading...";

        const header = incomeRows ? incomeRows.querySelector(".record-item") : null;
        if (incomeRows) {
            incomeRows.innerHTML = "";
            if (header) incomeRows.appendChild(header);
        }

        try {
            const params = new URLSearchParams({ from, to });
            const res = await fetch(
                `/api/manager/usage/utilities/${encodeURIComponent(utilityType)}/income?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) {
                if (runMsg) runMsg.textContent = `Failed (${res.status})`;
                if (totalIncomeText) totalIncomeText.textContent = "Rs. 0.00";
                if (incomeRows) {
                    incomeRows.insertAdjacentHTML(
                        "beforeend",
                        `<p class="muted" style="padding:10px 0;">No data.</p>`
                    );
                }
                return;
            }

            const d = await res.json();
            if (totalIncomeText) totalIncomeText.textContent = `Rs. ${money(d.totalIncome)}`;
            if (runMsg) runMsg.textContent = "Done ✅";

            const rows = Array.isArray(d.rows) ? d.rows : [];
            if (!incomeRows) return;

            if (rows.length === 0) {
                incomeRows.insertAdjacentHTML(
                    "beforeend",
                    `<p class="muted" style="padding:10px 0;">No income records found for selected period.</p>`
                );
                return;
            }

            incomeRows.insertAdjacentHTML(
                "beforeend",
                rows
                    .map(
                        (r) => `
          <div class="record-item">
            <div class="record-info">
              <span class="record-name">${escapeHtml(r.fullName || "-")} (#${escapeHtml(
                            r.customerId ?? "-"
                        )})</span>
              <span class="record-name">#${escapeHtml(r.connectionId ?? "-")}</span>
              <span class="record-name">${escapeHtml(r.billsCount ?? 0)}</span>
              <span class="record-name">${money(r.totalBilled)}</span>
              <span class="record-name">${money(r.totalPaid)}</span>
              <span class="record-name">${money(r.totalOutstanding)}</span>
            </div>
          </div>
        `
                    )
                    .join("")
            );
        } catch (e) {
            console.error(e);
            if (runMsg) runMsg.textContent = "Server error";
            if (totalIncomeText) totalIncomeText.textContent = "Rs. 0.00";
        }
    }

    function printIncomeReport(utilityType) {
        const from = document.getElementById("fromDate")?.value || "";
        const to = document.getElementById("toDate")?.value || "";
        const totalIncome = document.getElementById("totalIncomeText")?.textContent || "Rs. 0.00";
        const table = document.getElementById("incomeRows");

        const w = window.open("", "_blank");
        if (!w) return;

        w.document.write(`
      <html>
        <head>
          <title>${escapeHtml(utilityType)} Income Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin: 0 0 6px; }
            .muted { color: #666; margin: 0 0 12px; }
            .box { border: 1px solid #ddd; padding: 10px; border-radius: 10px; margin: 10px 0 16px; }
            .record-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .record-info { display: flex; gap: 14px; flex-wrap: wrap; }
            .record-info span { min-width: 120px; }
          </style>
        </head>
        <body>
          <h2>${escapeHtml(utilityType)} - Income Report</h2>
          <p class="muted">Period: ${escapeHtml(from)} to ${escapeHtml(to)}</p>

          <div class="box">
            <strong>Total Income:</strong> ${escapeHtml(totalIncome)}
          </div>

          ${table ? table.outerHTML : "<p>No table data</p>"}
        </body>
      </html>
    `);

        w.document.close();
        w.focus();
        w.print();
    }

    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
            loadSummary();
            loadUtilities();
        });
    }

    loadSummary();
    loadUtilities();
});

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}