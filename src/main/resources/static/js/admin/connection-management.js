let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterStatus = 'all';
let sortBy = 'connectionId';
let sortDirection = 'asc';

async function fetchConnections() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);
    if (filterStatus !== 'all') params.append('status', filterStatus);

    try {
        const response = await fetch(`/connections?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            handleTokenExpired();
            return;
        }

        if (!response.ok) {
            showToast('Failed to fetch connection records', 'error');
            return;
        }

        const data = await response.json();
        renderRecords(data.content);
        renderPagination(data.totalPages);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while fetching connections', 'error');
    }
}

function renderRecords(records) {
    const container = document.getElementById('recordsContainer');

    if (!records || records.length === 0) {
        container.innerHTML = `<p class="empty-state">No connections found</p>`;
        return;
    }

    container.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-id">#${record.connectionId}</div>
                <div class="record-name">Meter: ${record.meterSerialNumber}</div>
                <div class="record-nic">Type: ${record.utilityType}</div>
                <div class="record-department">Cust ID: ${record.customerId}</div>
                <div>
                    <span class="status-badge status-${record.status.toLowerCase()}">
                        ${record.status}
                    </span>
                </div>
            </div>
            <div class="record-actions">
                <button class="btn btn-view" onclick="viewRecord(${record.connectionId})">
                    Full View
                </button>
            </div>
        </div>
    `).join('');
}


window.addRecord = async function () {
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    modal.innerHTML = `
    <div class="modal-header">
        <div class="modal-header-left">
            <h3>Add New Utility Connection</h3>
        </div>
        <div class="modal-header-right">
            <button class="close-btn" onclick="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    </div>

    <div class="modal-body">
        <div class="detail-grid-top">
            <div>
                <div class="info-box">
                    <div style="display: flex; gap: 10px;">
                        <img src="../../images/info-icon.svg" alt="Info" style="width: 18px; height: 18px;">
                        <h4>How connection creation works</h4>
                    </div>
                    <ul>
                        <li><strong>Meter Serial</strong> must be unique across the system.</li>
                        <li>Ensure <strong>Customer ID</strong> and <strong>Tariff ID</strong> exist before saving.</li>
                    </ul>
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Meter Serial Number</span>
                    <input class="detail-value detail-input" id="meter_serial_number" placeholder="e.g. MTR-X100">
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
                    <span class="detail-label">Installation Date</span>
                    <input class="detail-value detail-input" id="install_date" type="date">
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Customer ID</span>
                    <input class="detail-value detail-input" id="customer_id" placeholder="Enter ID">
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tariff ID</span>
                    <input class="detail-value detail-input" id="tariff_id" placeholder="Enter ID">
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <select class="detail-value detail-input" id="status">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="detail-grid-bottom">
            <div></div>
            <button class="btn-adv btn-save" onclick="saveNewConnection()">Save</button>
        </div>
    </div>`;

    modal.classList.add('active');
    overlay.classList.add('active');
};


window.saveNewConnection = async function () {
    const payload = {
        meterSerialNumber: document.getElementById('meter_serial_number').value.trim(),
        utilityType: document.getElementById('utility_type').value,
        installDate: document.getElementById('install_date').value,
        customerId: parseInt(document.getElementById('customer_id').value),
        tariffId: parseInt(document.getElementById('tariff_id').value),
        status: document.getElementById('status').value
    };

    if (!payload.meterSerialNumber || !payload.installDate || isNaN(payload.customerId)) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        const response = await fetch('/connections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Connection saved successfully', 'success');
            closeModal();
            fetchConnections();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to save', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

async function refreshAudits() {
    const btn = document.getElementById('refreshBtn');
    const img = btn?.querySelector('img');

    if (!btn || !img) return;

    btn.disabled = true;
    btn.classList.add('spinning');

    const startTime = Date.now();

    const success = await fetchAudits();

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(800 - elapsed, 0);

    cachedAdmins = null;
    populateAdminFilter();

    setTimeout(() => {
        btn.classList.remove('spinning');
        btn.disabled = false;

        if (success) {
            showToast('Records refreshed', 'success');
        } else {
            showToast('Failed to refresh records', 'error');
        }
    }, remaining);
}


function closeModal() {
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');}