window.CashierCustomerInfo = (() => {
  const API_BASE = "";
  const els = {};
  let debounceTimer = null;

  let customersCache = [];
  let billsCache = [];

  function init() {
    els.search = document.getElementById("customerSearchInput");
    els.typeFilter = document.getElementById("customerTypeFilterCustomers");
    els.limit = document.getElementById("customerLimit");
    els.refreshBtn = document.getElementById("refreshCustomersBtn");

    els.list = document.getElementById("customerList");
    els.hint = document.getElementById("customerListHint");

    els.overlay = document.getElementById("customerOverlay");
    els.overlayContent = document.getElementById("overlayContent");
    els.overlayTitle = document.getElementById("overlayTitle");
    els.overlaySub = document.getElementById("overlaySub");
    els.closeOverlayBtn = document.getElementById("closeOverlayBtn");

    if (!els.list) return;

    wireEvents();
    preloadBills();
    loadInitialCustomers(); 
  }

  function wireEvents() {
    els.search?.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = (els.search?.value || "").trim();
        if (!q) loadInitialCustomers();
        else searchCustomers();
      }, 300);
    });

    els.typeFilter?.addEventListener("change", applyFilter);
    els.limit?.addEventListener("change", () => {
      const q = (els.search?.value || "").trim();
      if (!q) loadInitialCustomers();
      else searchCustomers();
    });

    els.refreshBtn?.addEventListener("click", () => {
      preloadBills();
      const q = (els.search?.value || "").trim();
      if (!q) loadInitialCustomers();
      else searchCustomers();
    });

    els.closeOverlayBtn?.addEventListener("click", closeOverlay);

    els.overlay?.addEventListener("click", (e) => {
      if (e.target === els.overlay) closeOverlay();
    });
  }

  async function preloadBills() {
    try {
      billsCache = await fetchJson(`/api/cashier/bills?limit=500`);
    } catch (e) {
      billsCache = [];
      console.warn("Failed to preload bills", e);
    }
  }

  async function loadInitialCustomers() {
    const limit = parseInt(els.limit?.value || "20", 10);
    setHint("Loading customers...");
    renderLoader();

    try {

      let res;
      try {
        res = await fetchJson(`/api/cashier/customers?limit=${isNaN(limit) ? 20 : limit}`);
      } catch {
        res = await fetchJson(`/api/cashier/customers/search?q=&limit=${isNaN(limit) ? 20 : limit}`);
      }

      customersCache = Array.isArray(res) ? res : [];
      if (!customersCache.length) {
        renderEmpty("No customers to show.");
        setHint("0 customers");
        return;
      }

      applyFilter();
    } catch (e) {
      console.error(e);
      renderEmpty("Failed to load customers. Check API endpoints.");
      setHint("Error");
      toast("Failed to load customers", "error");
    }
  }

  async function searchCustomers() {
    const q = (els.search?.value || "").trim();
    if (!q) {
 
      loadInitialCustomers();
      return;
    }

    const limit = parseInt(els.limit?.value || "20", 10);

    setHint("Searching customers...");
    renderLoader();

    try {
      const res = await fetchJson(
        `/api/cashier/customers/search?q=${encodeURIComponent(q)}&limit=${isNaN(limit) ? 20 : limit}`
      );
      customersCache = Array.isArray(res) ? res : [];
      applyFilter();
    } catch (e) {
      console.error(e);
      renderEmpty("Failed to search customers. Check console/API.");
      setHint("Error");
      toast("Customer search failed", "error");
    }
  }

  function applyFilter() {
    const type = (els.typeFilter?.value || "").trim().toUpperCase();
    let list = [...customersCache];

    if (type) list = list.filter(c => String(c.customerType || "").toUpperCase() === type);

    if (!list.length) {
      renderEmpty("No customers found.");
      setHint("0 customers");
      return;
    }

    renderCustomers(list);
    setHint(`${list.length} customer(s) shown`);
  }

  function renderCustomers(list) {
    els.list.innerHTML = "";

    list.forEach(c => {
      const id = c.userId ?? c.customerId ?? "-";
      const name = c.fullName ?? c.customerName ?? "-";
      const type = (c.customerType || "-").toString();
      const nic = c.nic ? `NIC: ${c.nic}` : null;

      const t = String(type).toUpperCase();
      const badgeClass =
        t === "HOUSEHOLD" ? "household" :
        t === "BUSINESS" ? "business" :
        (t === "GOVERNMENT ORGANIZATION" || t === "GOVERNMENT_ORGANIZATION" || t === "GOV") ? "gov" : "";

      const card = document.createElement("div");
      card.className = "customer-card";

      card.innerHTML = `
        <div>
          <h4>${escapeHtml(name)}</h4>
          <div class="customer-meta">
            <span class="badge ${badgeClass}">${escapeHtml(type)}</span>
            <span class="muted">Customer ID: ${escapeHtml(String(id))}</span>
            ${nic ? `<span class="muted">${escapeHtml(nic)}</span>` : ""}
          </div>
        </div>
        <button class="btn btn-view-sm" type="button">Full View</button>
      `;

      card.querySelector("button")?.addEventListener("click", () => openOverlay(c));
      els.list.appendChild(card);
    });
  }

  async function openOverlay(customer) {
    const customerId = customer.userId ?? customer.customerId;
    if (!customerId) {
      toast("Missing customerId", "error");
      return;
    }

    els.overlayTitle.textContent = customer.fullName || customer.customerName || "Customer";
    els.overlaySub.textContent = `Customer ID: ${customerId}`;
    els.overlayContent.innerHTML = `<div class="empty-state">Loading details...</div>`;

    els.overlay.classList.remove("hidden");

    try {
      const connections = await fetchJson(`/api/cashier/customers/${encodeURIComponent(customerId)}/connections`);
      const allBills = Array.isArray(billsCache) ? billsCache : [];

      const customerBills = allBills
        .filter(b => String(b.customerId) === String(customerId))
        .sort((a, b) => (b.billId || 0) - (a.billId || 0));

      els.overlayContent.innerHTML = `
        <div class="cu-grid">
          <div class="cu-box">
            <h5>Customer</h5>
            <div class="muted"><b>Name:</b> ${escapeHtml(customer.fullName || customer.customerName || "-")}</div>
            <div class="muted"><b>Type:</b> ${escapeHtml(customer.customerType || "-")}</div>
            <div class="muted"><b>NIC:</b> ${escapeHtml(customer.nic || "-")}</div>
            <div class="muted"><b>Email:</b> ${escapeHtml(customer.email || "-")}</div>
            <div class="muted"><b>Phone:</b> ${escapeHtml(customer.phoneNumber ?? customer.phone ?? "-")}</div>
          </div>

          <div class="cu-box">
            <h5>Connections</h5>
            ${
              Array.isArray(connections) && connections.length
                ? `<ul class="cu-list">
                    ${connections.map(x => `<li>${escapeHtml(x.utilityType || "-")} • Connection: ${escapeHtml(String(x.connectionId ?? "-"))}</li>`).join("")}
                  </ul>`
                : `<div class="muted">No connections found.</div>`
            }
          </div>

          <div class="cu-box" style="grid-column: 1 / -1;">
            <h5>Bills</h5>
            ${
              customerBills.length
                ? `<ul class="cu-list">
                    ${customerBills.map(b => `
                      <li>
                        #${escapeHtml(String(b.billId))} • ${escapeHtml(b.utilityType || "-")}
                        • ${escapeHtml(b.status || "-")}
                        • Outstanding: ${escapeHtml(money(b.outstandingAmount))}
                      </li>
                    `).join("")}
                  </ul>`
                : `<div class="muted">No bills found for this customer.</div>`
            }
          </div>
        </div>
      `;
    } catch (e) {
      console.error(e);
      els.overlayContent.innerHTML = `<div class="empty-state">Failed to load customer details.</div>`;
      toast("Failed to load full view", "error");
    }
  }

  function closeOverlay() {
    els.overlay?.classList.add("hidden");
  }

  async function fetchJson(path) {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + path, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
    return res.json();
  }

  function renderLoader() {
    els.list.innerHTML = `
      <div class="empty-state">
        <div class="dot-loader"><span></span><span></span><span></span></div>
        <div style="margin-top:10px;">Loading...</div>
      </div>
    `;
  }

  function renderEmpty(msg) {
    els.list.innerHTML = `<div class="empty-state">${escapeHtml(msg)}</div>`;
  }

  function setHint(msg) {
    if (els.hint) els.hint.textContent = msg || "";
  }

  function toast(message, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast active " + (type === "error" ? "error" : "success");
    el.textContent = message;
    setTimeout(() => { el.className = "toast"; }, 2500);
  }

  function money(val) {
    const num = typeof val === "number" ? val : parseFloat(val);
    if (Number.isNaN(num)) return "LKR 0.00";
    return `LKR ${num.toFixed(2)}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return { init, loadInitial: loadInitialCustomers };
})();
