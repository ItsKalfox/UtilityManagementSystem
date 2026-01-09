let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterStatus = 'all';
let sortBy = 'submittedDate';
let sortDirection = 'desc';


async function fetchComplaints() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);
    if (filterStatus !== 'all') params.append('status', filterStatus);

    try {
        const response = await fetch(`/complaints?${params.toString()}`, {
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
            showToast('Failed to fetch complaint records', 'error');
            return;
        }

        const data = await response.json();
        renderRecords(data.content);
        renderPagination(data.totalPages);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while fetching complaints', 'error');
    }
}

function renderRecords(records) {
    const container = document.getElementById('recordsContainer');

    if (!records || records.length === 0) {
        container.innerHTML = `<p class="empty-state">No complaints found</p>`;
        return;
    }

    container.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-id">#${record.complaintId}</div>
                <div class="record-name">${record.complaintType}</div>
                <div class="record-nic">Cust ID: ${record.customerId}</div>
                <div class="record-department">Officer: ${record.fieldOfficerId}</div>
                <div>
                    <span class="status-badge status-${record.status.toLowerCase().replace(' ', '-')}">
                        ${record.status}
                    </span>
                </div>
            </div>
            <div class="record-actions">
                <button class="btn btn-view" onclick="viewRecord(${record.complaintId})">
                    View & Resolve
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
            <h3>Log New Complaint</h3>
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
                        <h4>Complaint Guidelines</h4>
                    </div>
                    <ul>
                        <li>Assign a **Field Officer** to investigate the issue.</li>
                        <li>Status is set to **OPEN** by default.</li>
                    </ul>
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Customer ID</span>
                    <input class="detail-value detail-input" id="customer_id" placeholder="Enter ID">
                </div>
                <div class="detail-item">
                    <span class="detail-label">Complaint Type</span>
                    <input class="detail-value detail-input" id="complaint_type" placeholder="e.g. Leakage, High Bill">
                </div>
                <div class="detail-item">
                    <span class="detail-label">Assigned Officer ID</span>
                    <input class="detail-value detail-input" id="field_officer_id" placeholder="Enter ID">
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Admin ID (Logged By)</span>
                    <input class="detail-value detail-input" id="admin_id" placeholder="Enter your ID">
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Description</span>
                    <textarea class="detail-value detail-input" id="description" rows="3"></textarea>
                </div>
            </div>
        </div>

        <div class="detail-grid-bottom">
            <div></div>
            <button class="btn-adv btn-save" onclick="saveNewComplaint()">Submit Complaint</button>
        </div>
    </div>`;

    modal.classList.add('active');
    overlay.classList.add('active');
};


window.saveNewComplaint = async function () {
    const payload = {
        customerId: parseInt(document.getElementById('customer_id').value),
        fieldOfficerId: parseInt(document.getElementById('field_officer_id').value),
        adminId: parseInt(document.getElementById('admin_id').value),
        complaintType: document.getElementById('complaint_type').value.trim(),
        description: document.getElementById('description').value.trim(),
        status: 'OPEN'
    };

    if (isNaN(payload.customerId) || !payload.complaintType || !payload.description) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        const response = await fetch('/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Complaint logged successfully', 'success');
            closeModal();
            fetchComplaints();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to log complaint', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

function closeModal() {
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

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

document.addEventListener('DOMContentLoaded', fetchComplaints);