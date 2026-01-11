
document.addEventListener('DOMContentLoaded', fetchAreas);


async function fetchAreas() {
    try {
        const response = await fetch('/areas', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            handleTokenExpired();
            return;
        }

        if (!response.ok) {
            showToast('Failed to fetch areas', 'error');
            return;
        }

        const areas = await response.json();
        renderRecords(areas);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while loading areas', 'error');
    }
}


function renderRecords(areas) {
    const container = document.getElementById('recordsContainer');

    if (!areas || areas.length === 0) {
        container.innerHTML = `<p class="empty-state">No areas found</p>`;
        return;
    }

    container.innerHTML = areas.map(area => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-id">${area.areaCode}</div>
                <div class="record-name">${area.areaName}</div>
            </div>
        </div>
    `).join('');
}


window.addRecord = function () {
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-left">
                <h3>Add New Area</h3>
            </div>
            <div class="modal-header-right">
                <button class="close-btn" onclick="closeModal()">✕</button>
            </div>
        </div>

        <div class="modal-body">
            <div class="detail-grid-top">
                <div class="info-box">
                    <div style="display:flex; gap:10px;">
                        <img src="../../images/info-icon.svg" style="width:18px;">
                        <h4>How area creation works</h4>
                    </div>
                    <ul>
                        <li><strong>Area Code</strong> must be unique (e.g. A001).</li>
                        <li>This area can later be linked to customers and staff.</li>
                    </ul>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Area Code</span>
                    <input class="detail-value detail-input" id="area_code" placeholder="A001">
                </div>

                <div class="detail-item">
                    <span class="detail-label">Area Name</span>
                    <input class="detail-value detail-input" id="area_name" placeholder="Colombo 01">
                </div>
            </div>

            <div class="detail-grid-bottom">
                <button class="btn-adv btn-save" onclick="saveNewArea()">Save</button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
};


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

        if (!response.ok) {
            const err = await response.json();
            showToast(err.message || 'Failed to save area', 'error');
            return;
        }

        showToast('Area created successfully', 'success');
        closeModal();
        fetchAreas();

    } catch (err) {
        console.error(err);
        showToast('Server error while saving area', 'error');
    }
};


function closeModal() {
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}
