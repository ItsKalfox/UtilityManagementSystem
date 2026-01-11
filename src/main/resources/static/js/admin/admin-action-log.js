let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterAdmin = null;
let filterEntity = 'all';
let sortBy = 'logId';
let sortDirection = 'desc';
let cachedAdmins = null;
let linkedUserId = null;
let nicCheckInProgress = false;
let lastCheckedNic = null;
let fromDate = null;
let toDate = null;

async function fetchAdmins() {
    if (cachedAdmins) return cachedAdmins;

    const response = await fetch('/api/list/admins', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }
        if (data.message === 'Token expired') {
            const confirmed = await handleTokenExpired();

            if (!confirmed) return;

            const theme = localStorage.getItem('theme');

            localStorage.clear();

            if (theme !== null) {
                localStorage.setItem('theme', theme);
            }

            window.location.replace('../../index.html');
        }
    }

    if (!response.ok) {
        showToast('Failed to load data', 'error');
    }

    cachedAdmins = await response.json();
    return cachedAdmins;
}

async function populateAdminFilter() {
    const select = document.getElementById('filterAdmin');
    if (!select) return;

    try {
        const admins = await fetchAdmins();
        if (!admins) return;

        select.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

        admins.forEach(admin => {
            const option = document.createElement('option');
            option.value = admin.adminId;
            option.textContent = admin.adminName

            select.appendChild(option);
        });

    } catch (err) {
        console.error(err);
        showToast('Failed to load admins', 'error');
    }
}

async function fetchAudits() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);
    if (filterEntity !== 'all') params.append('entity', filterEntity);
    if (filterAdmin !== null) { params.append('adminId', filterAdmin); }
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);

    console.log('FETCH:', params.toString());

    try {
        const response = await fetch(`/action-log?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }
            if (data.message === 'Token expired') {
                const confirmed = await handleTokenExpired();
                if (!confirmed) return;

                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme !== null) {
                    localStorage.setItem('theme', theme);
                }

                window.location.replace('../../index.html');
            }
        }

        if (!response.ok) {
            let message = 'Failed to fetch audit logs';
            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}
            showToast(message, 'error');
            return;
        }

        const data = await response.json();

        renderRecords(data.content);
        renderPagination(data.totalPages);

        return true;

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while fetching audit logs', 'error');
    }
}

function renderRecords(records) {
    const container = document.getElementById('recordsContainer');

    if (!records || records.length === 0) {
        container.innerHTML = `<p class="empty-state">No records found</p>`;
        return;
    }

    container.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info record-info-audit">
                <div class="record-id">#${record.logId}</div>
                <div class="record-name">${record.entityType}</div>
                <div class="record-nic">ID: #${record.entityId}</div>
                <div class="record-vehicleNo">${record.action}</div>
                <div class="record-vehicleNo">${new Date(record.timestamp).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    let buttons = [];

    for (let i = 0; i < totalPages; i++) {
        buttons.push(`
            <button class="page-btn ${i === currentPage ? 'active' : ''}"
                onclick="goToPage(${i})">
                ${i + 1}
            </button>
        `);
    }

    pagination.innerHTML = buttons.join('');
}

window.goToPage = function (page) {
    currentPage = page;
    fetchAudits();
};

document.addEventListener('DOMContentLoaded', () => {
    fetchAudits();
    populateAdminFilter();

    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');

    if (fromDateInput) {
        fromDateInput.addEventListener('change', e => {
            fromDate = e.target.value || null;
            currentPage = 0;
            fetchAudits();
        });
    }

    if (toDateInput) {
        toDateInput.addEventListener('change', e => {
            toDate = e.target.value || null;
            currentPage = 0;
            fetchAudits();
        });
    }

    const filterAdminSelect = document.getElementById('filterAdmin');
    if (filterAdminSelect) {
        filterAdminSelect.addEventListener('change', e => {
        filterAdmin = e.target.value === 'all'? null : Number(e.target.value);
            currentPage = 0;
            fetchAudits();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.trim();
            currentPage = 0;
            fetchAudits();
        });
    }

    const filterEntitySelect = document.getElementById('filterEntity');
    if (filterEntitySelect) {
        filterEntitySelect.addEventListener('change', e => {
            filterEntity = e.target.value;
            currentPage = 0;
            fetchAudits();
        });
    }

    const sortOrderSelect = document.getElementById('sortOrderSelect');
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', e => {
            sortDirection = e.target.value;
            currentPage = 0;
            fetchAudits();
        });
    }
});

fromDateInput.addEventListener('change', () => {
    toDateInput.min = fromDateInput.value;
});

toDateInput.addEventListener('change', () => {
    fromDateInput.max = toDateInput.value;
});

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

document.getElementById('modalOverlay').addEventListener('click', closeModal);