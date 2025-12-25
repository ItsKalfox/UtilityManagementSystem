let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterStatus = 'all';
let sortBy = 'userId';
let sortDirection = 'asc';
let cachedAreas = null;
let linkedUserId = null;
let nicCheckInProgress = false;
let lastCheckedNic = null;

async function fetchManagers() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);
    if (filterStatus !== 'all') params.append('status', filterStatus);

    console.log('FETCH:', params.toString());

    try {
        const response = await fetch(`/managers?${params.toString()}`, {
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
            let message = 'Failed to fetch manager';
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
        showToast('Unexpected error while fetching manager records', 'error');
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
            <div class="record-info">
                <div class="record-id">#${record.userId}</div>
                <div class="record-name">${record.fullName}</div>
                <div class="record-nic">${record.nic}</div>
                <div class="record-department">${record.department}</div>
                <div>
                    <span class="status-badge status-${record.status.toLowerCase()}">
                        ${record.status}
                    </span>
                </div>
            </div>

            <div class="record-actions">
                <button class="btn btn-view"
                    onclick="viewRecord(${record.userId})">
                    Full View
                </button>
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
    fetchManagers();
};

document.addEventListener('DOMContentLoaded', () => {
    fetchManagers();
    applyPermissionVisibility('addManagerBtn', 'CREATE_MANAGER');

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.trim();
            currentPage = 0;
            fetchManagers();
        });
    }

    const filterStatusSelect = document.getElementById('filterStatus');
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener('change', e => {
            filterStatus = e.target.value;
            currentPage = 0;
            fetchManagers();
        });
    }

    const sortBySelect = document.getElementById('sortBySelect');
    if (sortBySelect) {
        sortBySelect.addEventListener('change', e => {
            sortBy = e.target.value;
            currentPage = 0;
            fetchManagers();
        });
    }

    const sortOrderSelect = document.getElementById('sortOrderSelect');
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', e => {
            sortDirection = e.target.value;
            currentPage = 0;
            fetchManagers();
        });
    }
});


window.addRecord = async function () {
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    linkedUserId = null;

    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-left">
                <h3>Add Manager</h3>
            </div>
            <div class="modal-header-right">
                <button class="close-btn" onclick="closeModal()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="modal-body">
            <div class="detail-grid-top">
                <div>
                    <div class="info-box">
                        <div style="display: flex; gap: 10px;">
                            <img src="../../images/info-icon.svg" alt="Info" style="width: 18px; height: 18px; margin-top: 2px; filter: var(--icon-filter); transition: filter 0.3s ease;">
                            <h4>How manager creation works</h4>
                        </div>
                        <ul>
                            <li>
                                <strong>Enter NIC first</strong> and press <kbd>Enter</kbd>.
                                The system will automatically check NIC availability.
                            </li>
                            <li>
                                After saving:
                                <ul>
                                    <li>User is created in <strong>deactivated</strong> state</li>
                                    <li>Activate the account and use <strong>Reset Password</strong> to send login credentials in next page</li>    
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <div class="detail-item">
                        <span class="detail-label">NIC</span>
                        <input class="detail-value detail-input" id="nic">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Full Name</span>
                        <input class="detail-value detail-input" id="fullName">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <input class="detail-value detail-input" id="email" type="email">
                    </div>
                </div>

                <div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Phone Numbers</span>
                        <div class="detail-value-number phone-numbers" id="newPhoneNumbers"></div>
                        <button class="add-phone-btn" onclick="addPhoneNew()">Add Phone</button>
                    </div>
                </div>
            </div>

            <div class="detail-grid-middle">
                <div>
                    <div class="detail-item">
                        <span class="detail-label">Department</span>
                        <input class="detail-value detail-input" id="department">
                    </div>
                </div>
            </div>

            <div class="detail-grid-bottom">
                <div></div>
                <button class="btn-adv btn-save" onclick="saveNewManager()">Save</button>
            </div>

        </div>

        <div class="modal-footer">
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
    addPhoneNew();

    const nicInput = modal.querySelector('#nic');

    nicInput.addEventListener('blur', () => handleNicCheck(nicInput));
    nicInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNicCheck(nicInput);
        }
    });

    nicInput.addEventListener('input', () => resetIdentityFields());
};

window.addPhoneNew = function () {
    const container = document.getElementById('newPhoneNumbers');

    if (container.children.length >= 3) {
        showToast('Maximum 3 phone numbers allowed', 'error');
        return;
    }

    const div = document.createElement('div');
    div.className = 'phone-item';

    div.innerHTML = `
        <input class="phone-number" placeholder="+947XXXXXXX">
        <select class="phone-category">
            <option value="MOBILE">Mobile</option>
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
        </select>
        <button class="remove-phone-btn" onclick="removePhoneNew(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    container.appendChild(div);

    updatePhoneRemoveButtons();
};

function removePhoneNew(btn) {
    const container = document.getElementById('newPhoneNumbers');

    if (container.children.length <= 1) {
        return;
    }

    btn.closest('.phone-item').remove();
    updatePhoneRemoveButtons();
}

function updatePhoneRemoveButtons() {
    const items = document.querySelectorAll('#newPhoneNumbers .phone-item');

    items.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-phone-btn');
        if (!removeBtn) return;

        removeBtn.style.display = items.length > 1 ? 'inline-flex' : 'none';
    });
}

function resetIdentityFields() {
    const modal = document.getElementById('recordModal');

    linkedUserId = null;
    lastCheckedNic = null;

    ['fullName', 'email'].forEach(id => {
        const el = modal.querySelector(`#${id}`);
        if (el) {
            el.disabled = false;
            el.value = '';
        }
    });

    modal.querySelector('#newPhoneNumbers').innerHTML = '';

    const addPhoneBtn = modal.querySelector('.add-phone-btn');
    if (addPhoneBtn) {
        addPhoneBtn.disabled = false;
        addPhoneBtn.style.display = 'inline-flex';
    }
    addPhoneNew();
}

async function handleNicCheck(nicInput) {
    const nic = nicInput.value.trim();
    if (!nic || nicCheckInProgress || nic === lastCheckedNic) return;

    lastCheckedNic = nic;
    nicCheckInProgress = true;

    try {
        const response = await fetch(`/managers/check-nic/${nic}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            let data = {};
            try {
                data = await response.json();
            } catch {}

            if (data.message === 'Token expired') {
                result.close();
                const confirmed = await handleTokenExpired();
                if (!confirmed) return;

                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme !== null) localStorage.setItem('theme', theme);

                window.location.replace('../../index.html');
                return;
            }
        }

        if (!response.ok) {
            let message = 'Failed to check NIC';
            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}
            showToast(message, 'error');
            return;
        }

        const data = await response.json();

        if (data.exists && data.hasManagerProfile) {
            showToast('Manager already exists.', 'error');

            nicInput.value = '';
            nicInput.focus();

            resetIdentityFields();
            lastCheckedNic = null;

            return;
        }

        if (data.exists && !data.hasManagerProfile && data.userId) {
            const result = await showConfirmModal({
                title: 'Details Found',
                message: 'An existing user was found with this NIC. Do you want to link to this user and create a manager profile?',
                confirmText: 'Yes',
                cancelText: 'No', 
                danger: false
            });
            
            if (!result || !result.confirmed) {
                nicInput.value = '';
                nicInput.focus();
                resetIdentityFields();
                lastCheckedNic = null;
                return;
            }
            
            result.close();
            await hydrateExistingUser(data.userId);
        }

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while checking NIC', 'error');
    } finally {
        nicCheckInProgress = false;
    }
}

async function hydrateExistingUser(userId) {
    try {
        const response = await fetch(`/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            let data = {};
            try {
                data = await response.json();
            } catch {}

            if (data.message === 'Token expired') {
                result.close();
                const confirmed = await handleTokenExpired();
                if (!confirmed) return;

                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme !== null) localStorage.setItem('theme', theme);

                window.location.replace('../../index.html');
                return;
            }
        }

        if (!response.ok) {
            let message = 'Failed to load user details';

            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}

            result.close();
            showToast(message, 'error');
            return;
        }

        const user = await response.json();
        linkedUserId = user.userId;

        const modal = document.getElementById('recordModal');

        modal.querySelector('#fullName').value = user.fullName;
        modal.querySelector('#email').value = user.email;
        modal.querySelector('#fullName').disabled = true;
        modal.querySelector('#email').disabled = true;
        modal.querySelector('#nic').disabled = true;

        const phoneContainer = modal.querySelector('#newPhoneNumbers');
        phoneContainer.innerHTML = '';

        user.phoneNumbers.forEach(p => {
            const div = document.createElement('div');
            div.className = 'phone-item';
            div.innerHTML = `
                <input class="phone-number" value="${p.phoneNumber}" disabled>
                <select class="phone-category" disabled>
                    <option selected>${
                        p.numberType.charAt(0) + p.numberType.slice(1).toLowerCase()
                    }</option>
                </select>
            `;
            phoneContainer.appendChild(div);
        });

        const addPhoneBtn = modal.querySelector('.add-phone-btn');
        if (addPhoneBtn) {
            addPhoneBtn.disabled = true;
            addPhoneBtn.style.display = 'none';
        }

        showToast('User details loaded successfully.', 'success');

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while loading details', 'error');
    }
}

window.saveNewManager = async function () {
    const modal = document.getElementById('recordModal');

    const fullNameEl = modal.querySelector('#fullName');
    const emailEl = modal.querySelector('#email');
    const nicEl = modal.querySelector('#nic');
    const departmentEl = modal.querySelector('#department');

    if (!fullNameEl || !emailEl || !nicEl || !departmentEl) {
        showToast('Form is not ready. Please reopen the dialog.', 'error');
        return;
    }

    const payload = {
        fullName: fullNameEl.value.trim(),
        email: emailEl.value.trim(),
        nic: nicEl.value.trim(),
        department: departmentEl.value.trim(),
        phoneNumbers: []
    };

    if (!payload.fullName || !payload.email || !payload.nic || !payload.department) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    modal.querySelectorAll('#newPhoneNumbers .phone-item').forEach(item => {
        const number = item.querySelector('.phone-number')?.value?.trim();
        const type = item.querySelector('.phone-category')?.value;

        if (number) {
            payload.phoneNumbers.push({
                phoneNumber: number,
                numberType: type
            });
        }
    });

    if (payload.phoneNumbers.length === 0) {
        showToast('At least one phone number is required', 'error');
        return;
    }

    const isExistingUser = linkedUserId !== null;

    const endpoint = isExistingUser
        ? '/managers'
        : '/managers/full';

    if (isExistingUser) {
        payload.managerId = linkedUserId;
        delete payload.fullName;
        delete payload.email;
        delete payload.nic;
        delete payload.phoneNumbers;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            let data = {};
            try {
                data = await response.json();
            } catch {}

            if (data.message === 'Token expired') {
                result.close();
                const confirmed = await handleTokenExpired();
                if (!confirmed) return;

                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme !== null) localStorage.setItem('theme', theme);

                window.location.replace('../../index.html');
                return;
            }
        }

        if (!response.ok) {
            let message = 'Failed to create manager';
            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}
            showToast(message, 'error');
            return;
        }

        const record = await response.json();

        closeModal();
        showToast('Manager added successfully', 'success');
        fetchManagers();
        viewRecord(record.userId);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while creating manager', 'error');
    }
};

window.viewRecord = async function (id) {
    try {
        const response = await fetch(`/managers/${id}`, {
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
            showToast('Failed to load record', 'error');
            return;
        }

        const record = await response.json();
        currentEditRecord = { ...record };
        isEditMode = false;

        const modal = document.getElementById('recordModal');
        const overlay = document.getElementById('modalOverlay');

        let editButtonHtml = '';
        let deleteButtonHtml = '';
        let statusButtonHtml = '';
        let resetPasswordButtonHtml = '';
        let advancedSectionHtml = '';

        if (hasPermission('DELETE_MANAGER')) {
            deleteButtonHtml = `<button class="btn-adv btn-delete" onclick="deleteRecord(${record.userId})">Delete Record</button>`;
        } else {
            deleteButtonHtml = '';
        }

        if (hasPermission('UPDATE_MANAGER')) {
            editButtonHtml = `<button class="icon-btn-long" id="editBtn" onclick="enableEdit()">
                                <img src="../images/edit-icon-text.svg" alt="EditBtn">
                            </button>`;
            if (record.status === 'ACTIVE') {
                statusButtonHtml = `
                <button class="btn-adv btn-secondary" onclick="deactivateAccount(${record.userId})">Deactivate Account</button>`;
            } else {
                statusButtonHtml = `
                <button class="btn-adv btn-secondary" onclick="activateAccount(${record.userId})">Activate Account</button>`;
            }
            resetPasswordButtonHtml = `<button class="btn-adv btn-secondary" onclick="resetPassword(${record.userId})">Reset Password</button>`
        } else {
            editButtonHtml = '';
            statusButtonHtml = '';
            resetPasswordButtonHtml = '';
        }

        if (hasPermission('UPDATE_MANAGER') || hasPermission('DELETE_MANAGER')) {
            advancedSectionHtml = `
                    <div class="expandable-section">
                        <div class="expandable-header" onclick="toggleExpandable()">
                            <span class="expandable-title">Advanced</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="expandIcon">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </div>
                        <div class="expandable-content" id="expandableContent">
                            <div class="system-actions">
                                <div class="system-actions-left">
                                    ${statusButtonHtml}
                                    ${resetPasswordButtonHtml}
                                </div>
                                <div class="system-actions-right">
                                    ${deleteButtonHtml}
                                </div>
                            </div>
                        </div>
                    </div>`;
        } else {
            advancedSectionHtml = ``;
        }

        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-header-left">
                    <h3>Full Details</h3>
                    <div class="modal-header-id">ID #${record.userId}</div>
                    ${editButtonHtml}
                </div>
                <div class="modal-header-right">
                    <button class="btn btn-save" id="saveBtn" style="display:none" onclick="saveRecord(${id})">Save</button>
                    <button class="btn btn-secondary" id="editCancelBtn" style="display:none" onclick="disableEdit(${id})"> Cancel</button>
                    <button class="close-btn" onclick="closeModal()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="modal-body">
                <div class="detail-grid-top"  id="detailGrid">
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Full Name</span>
                            <span class="detail-value" id="field-name">${record.fullName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value" id="field-email">${record.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">NIC</span>
                            <span class="detail-value" id="field-nic">${record.nic}</span>
                        </div>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">Phone Numbers</span>
                        <div class="detail-value-number phone-numbers" id="phoneNumbers">
                            ${record.phoneNumbers.map((p, i) => `
                                <div class="phone-item" data-index="${i}">
                                    <input type="text" value="${p.phoneNumber}" class="phone-number" disabled>
                                    <select class="phone-category" disabled>
                                        <option value="MOBILE" ${p.numberType === 'MOBILE' ? 'selected' : ''}>Mobile</option>
                                        <option value="HOME" ${p.numberType === 'HOME' ? 'selected' : ''}>Home</option>
                                        <option value="WORK" ${p.numberType === 'WORK' ? 'selected' : ''}>Work</option>
                                    </select>
                                    <button class="remove-phone-btn" style="display: none;" onclick="removePhone(${i})">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="add-phone-btn" style="display: none;" onclick="addPhone()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Phone Number
                        </button>
                    </div>

                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value">
                                <span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created Date</span>
                            <span class="detail-value">${new Date(record.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Updated Date</span>
                            <span class="detail-value">${new Date(record.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-grid-middle"  id="detailGrid">
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Department</span>
                            <span class="detail-value" id="field-department">${record.department}</span>
                        </div>
                    </div>
                </div>
                ${advancedSectionHtml}
            </div>

            <div class="modal-footer">
            </div>
        `;

        modal.classList.add('active');
        overlay.classList.add('active');

    } catch (e) {
        console.error(e);
        showToast('Unexpected error', 'error');
    }
};

window.disableEdit = function(id) {
    closeModal();
    viewRecord(id);
}

window.enableEdit = async function() {
    isEditMode = true;
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'block';
    document.getElementById('editCancelBtn').style.display = 'block';

    const editableFields = ['name', 'email', 'nic', 'department'];

    editableFields.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        if (!element) return;
        const value = element.textContent;
        element.innerHTML = `<input type="text" value="${value}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--gray-50); color: var(--text-primary);">`;
    });

    document.querySelectorAll('.phone-number, .phone-category').forEach(el => {
        el.disabled = false;
    });

    document.querySelectorAll('.remove-phone-btn').forEach(btn => {
        if (document.querySelectorAll('.phone-item').length > 1) {
            btn.style.display = 'block';
        }
    });

    document.querySelector('.add-phone-btn').style.display = 'inline-flex';
};

window.addPhone = function() {
    const phoneNumbers = document.getElementById('phoneNumbers');
    const currentPhones = phoneNumbers.querySelectorAll('.phone-item').length;

    if (currentPhones >= 3) {
        showToast('Maximum 3 phone numbers allowed', 'error');
        return;
    }

    const newIndex = currentPhones;
    const phoneItem = document.createElement('div');
    phoneItem.className = 'phone-item';
    phoneItem.setAttribute('data-index', newIndex);
    phoneItem.innerHTML = `
        <input type="text" value="" class="phone-number" placeholder="Enter phone number">
        <select class="phone-category">
            <option value="mobile">Mobile</option>
            <option value="home">Home</option>
            <option value="work">Work</option>
        </select>
        <button class="remove-phone-btn" onclick="removePhone(${newIndex})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    phoneNumbers.appendChild(phoneItem);
};

window.removePhone = function(index) {
    const phoneItem = document.querySelector(`.phone-item[data-index="${index}"]`);
    if (phoneItem) {
        phoneItem.remove();
    }
};

window.saveRecord = async function (id) {
    try {
        const payload = {
            fullName: document.querySelector('#field-name input').value.trim(),
            email: document.querySelector('#field-email input').value.trim(),
            nic: document.querySelector('#field-nic input').value.trim(),
            department: document.querySelector('#field-department input').value.trim(),
            phoneNumbers: []
        };

        document.querySelectorAll('.phone-item').forEach(item => {
            const number = item.querySelector('.phone-number')?.value.trim();
            const category = item.querySelector('.phone-category')?.value;

            if (number) {
                payload.phoneNumbers.push({
                    phoneNumber: number,
                    numberType: category.toUpperCase()
                });
            }
        });

        Object.keys(payload).forEach(key => {
            if (
                payload[key] === '' ||
                (Array.isArray(payload[key]) && payload[key].length === 0)
            ) {
                delete payload[key];
            }
        });

        console.log('PATCH PAYLOAD:', payload);

        const response = await fetch(`/managers/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
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
            const err = await response.json();
            console.error(err);
            showToast(err.message || 'Failed to update record', 'error');
            return;
        }

        closeModal();
        showToast('Record updated successfully', 'success');

        fetchManagers();

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while saving record', 'error');
    }
};

window.deleteRecord = async function (id) {
    const result = await showConfirmModal({
        title: 'Delete Manager',
        message: 'Are you sure you want to permanently delete this manager? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true
    });

    if (!result || !result.confirmed) {
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/managers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            let message = 'Failed to delete record';

            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        showToast('Record deleted successfully', 'success');
        closeModal();

        fetchManagers();

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while deleting record', 'error');
    }
};

window.activateAccount = async function(id) {
    const result = await showConfirmModal({
        title: 'Activate Account',
        message: 'Are you sure you want to activate this account? This will enable user access.',
        confirmText: 'Activate',
        cancelText: 'Cancel',
        danger: false
    });

    if (!result || !result.confirmed) {
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/managers/${id}/activate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            let message = 'Failed to activate account';

            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        closeModal();
        showToast('Account activated successfully', 'success');

        fetchManagers();

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while activating account', 'error');
    }
};

window.deactivateAccount = async function(id) {
    const result = await showConfirmModal({
        title: 'Deactivate Account',
        message: 'Are you sure you want to deactivate this account? This will disable user access.',
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        danger: true
    });

    if (!result || !result.confirmed) {
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/managers/${id}/deactivate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            let message = 'Failed to deactivate account';

            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        closeModal();
        showToast('Account deactivated successfully', 'success');

        fetchManagers();

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while deactivating account', 'error');
    }
};

window.resetPassword = async function (id) {
    const result = await showConfirmModal({
        title: 'Reset Password',
        message: 'The existing password will be invalidated, and a new password will be generated and sent to the user’s email address.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        danger: false
    });

    if (!result || !result.confirmed) {
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/managers/${id}/reset-password`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            let data = {};
            try {
                data = await response.json();
            } catch {}

            if (data.message === 'Token expired') {
                result.close();
                const confirmed = await handleTokenExpired();
                if (!confirmed) return;

                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme !== null) localStorage.setItem('theme', theme);

                window.location.replace('../../index.html');
                return;
            }
        }

        if (!response.ok) {
            let message = 'Failed to reset password';

            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        closeModal();
        showToast('Password reset email sent', 'success');

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while resetting password', 'error');
    }
};

async function refreshManagers() {
    const btn = document.getElementById('refreshBtn');
    const img = btn?.querySelector('img');

    if (!btn || !img) return;

    btn.disabled = true;
    btn.classList.add('spinning');

    const startTime = Date.now();

    const success = await fetchManagers();

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(800 - elapsed, 0);

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