let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let sortBy = 'areaCode';
let sortDirection = 'asc';

/**
 * 1. FETCH & RENDER AREAS
 */
async function fetchAreas() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);

    try {
        const response = await fetch(`/areas?${params.toString()}`, {
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
            showToast('Failed to fetch area records', 'error');
            return;
        }

        const data = await response.json();
        renderRecords(data.content);
        renderPagination(data.totalPages);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while fetching areas', 'error');
    }
}

function renderRecords(records) {
    const container = document.getElementById('recordsContainer');

    if (!records || records.length === 0) {
        container.innerHTML = `<p class="empty-state">No areas found</p>`;
        return;
    }

    container.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-id">Code: ${record.areaCode}</div>
                <div class="record-name">${record.areaName}</div>
            </div>
            <div class="record-actions">
                <button class="btn btn-view" onclick="viewRecord('${record.areaCode}')">
                    Full View
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * 2. ADD NEW AREA MODAL
 */
window.addRecord = async function () {
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    modal.innerHTML = `
    <div class="modal-header">
        <div class="modal-header-left">
            <h3>Add New Area</h3>
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
                        <h4>How area creation works</h4>
                    </div>
                    <ul>
                        <li><strong>Area Code</strong> is the unique identifier (e.g., 'COL-01').</li>
                        <li>This code will be used to group customers and meter readers.</li>
                    </ul>
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Area Code</span>
                    <input class="detail-value detail-input" id="area_code" placeholder="e.g. ZN-001">
                </div>
            </div>

            <div>
                <div class="detail-item">
                    <span class="detail-label">Area Name</span>
                    <input class="detail-value detail-input" id="area_name" placeholder="e.g. North District">
                </div>
            </div>
        </div>

        <div class="detail-grid-bottom">
            <div></div>
            <button class="btn-adv btn-save" onclick="saveNewArea()">Save</button>
        </div>
    </div>`;

    modal.classList.add('active');
    overlay.classList.add('active');
};

/**
 * 3. SAVE LOGIC
 */
window.saveNewArea = async function () {
    const payload = {
        areaCode: document.getElementById('area_code').value.trim(),
        areaName: document.getElementById('area_name').value.trim()
    };

    if (!payload.areaCode || !payload.areaName) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/areas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Area created successfully', 'success');
            closeModal();
            fetchAreas();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to save area', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

/**
 * 4. UTILS
 */
function closeModal() {
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        pagination.innerHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
    }
}

window.goToPage = function(page) {
    currentPage = page;
    fetchAreas();
};

document.addEventListener('DOMContentLoaded', fetchAreas);