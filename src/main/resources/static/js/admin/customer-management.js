let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterType = 'all';
let filterStatus = 'all';
let sortBy = 'userId';
let sortDirection = 'asc';

let cachedAreas = null;

async function fetchAreas() {
    if (cachedAreas) return cachedAreas;

    const response = await fetch('/api/areas', {
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
    }

    cachedAreas = await response.json();
    return cachedAreas;
}

async function fetchCustomers() {
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection
    });

    if (searchTerm) params.append('search', searchTerm);
    if (filterType !== 'all') params.append('type', filterType);
    if (filterStatus !== 'all') params.append('status', filterStatus);

    console.log('FETCH:', params.toString());

    try {
        const response = await fetch(`/customers?${params.toString()}`, {
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
            console.error('Failed to fetch customers');
            return false;
        }

        const data = await response.json();

        renderRecords(data.content);
        renderPagination(data.totalPages);

        return true;

    } catch (err) {
        console.error('API error:', err);
        return false
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
                <div class="record-nic">${record.customerType}</div>
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
    fetchCustomers();
};

document.addEventListener('DOMContentLoaded', () => {

    fetchCustomers();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.trim();
            currentPage = 0;
            fetchCustomers();
        });
    }

    const filterTypeSelect = document.getElementById('filterType');
    if (filterTypeSelect) {
        filterTypeSelect.addEventListener('change', e => {
            filterType = e.target.value;
            currentPage = 0;
            fetchCustomers();
        });
    }

    const filterStatusSelect = document.getElementById('filterStatus');
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener('change', e => {
            filterStatus = e.target.value;
            currentPage = 0;
            fetchCustomers();
        });
    }

    const sortBySelect = document.getElementById('sortBySelect');
    if (sortBySelect) {
        sortBySelect.addEventListener('change', e => {
            sortBy = e.target.value;
            currentPage = 0;
            fetchCustomers();
        });
    }

    const sortOrderSelect = document.getElementById('sortOrderSelect');
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', e => {
            sortDirection = e.target.value;
            currentPage = 0;
            fetchCustomers();
        });
    }
});


window.addRecord = async function () {
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    let areas = [];
    try {
        areas = await fetchAreas();
    } catch {
        showToast('Failed to load areas', 'error');
        return;
    }

    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-left">
                <h3>Add Customer</h3>
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
                    <div class="detail-item">
                        <span class="detail-label">Full Name</span>
                        <input class="detail-value detail-input" id="fullName">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <input class="detail-value detail-input" id="email" type="email">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">NIC</span>
                        <input class="detail-value detail-input" id="nic">
                    </div>
                </div>

                <div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">Phone Numbers</span>
                        <div class="detail-value phone-numbers" id="newPhoneNumbers"></div>
                        <button class="add-phone-btn" onclick="addPhoneNew()">Add Phone</button>
                    </div>
                </div>

                <div>
                </div>
            </div>

            <div class="detail-grid-middle">
                <div>
                    <div class="detail-item">
                        <span class="detail-label">Address Line 1</span>
                        <input class="detail-value detail-input" id="addressLine1">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Address Line 2</span>
                        <input class="detail-value detail-input" id="addressLine2">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">City</span>
                        <input class="detail-value detail-input" id="addressCity">
                    </div>
                </div>

                <div>
                    <div class="detail-item">
                        <span class="detail-label">Area Code</span>
                        <select class="detail-value detail-input" id="areaCode">
                            ${areas.map(a => `
                                <option value="${a.areaCode}">
                                    ${a.areaCode} - ${a.areaName}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Postal Code</span>
                        <input class="detail-value detail-input" id="addressPostalCode">
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Customer Type</span>
                        <select class="detail-value detail-input" id="customerType"
                            onchange="renderCustomerTypeFields(this.value)">
                            <option value="">Select</option>
                            <option value="HOUSEHOLD">Household</option>
                            <option value="BUSINESS">Business</option>
                            <option value="GOVERNMENT ORGANIZATION">Government Organization</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div id="typeSpecificContainer"></div>
                </div>
            </div>

            <div class="detail-grid-bottom">
                <div></div>
                <button class="btn-adv btn-save" onclick="saveNewCustomer()">Save</button>
            </div>

        </div>

        <div class="modal-footer">
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
};

window.renderCustomerTypeFields = function (type) {
    const c = document.getElementById('typeSpecificContainer');

    if (!type) {
        c.innerHTML = '';
        return;
    }

    if (type === 'HOUSEHOLD') {
        c.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Household Size</span>
                <input class="detail-value detail-input" id="householdSize" type="number" min="1">
            </div>`;
    }

    if (type === 'BUSINESS') {
        c.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Business Type</span>
                <input class="detail-value detail-input" id="businessType">
            </div>
            <div class="detail-item">
                <span class="detail-label">Business Reg No</span>
                <input class="detail-value detail-input" id="businessRegiNum">
            </div>
            <div class="detail-item">
                <span class="detail-label">Tax ID</span>
                <input class="detail-value detail-input" id="taxId">
            </div>`;
    }

    if (type === 'GOVERNMENT ORGANIZATION') {
        c.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Government ID</span>
                <input class="detail-value detail-input" id="governmentId">
            </div>
            <div class="detail-item">
                <span class="detail-label">Department</span>
                <input class="detail-value detail-input" id="department">
            </div>`;
    }
};

window.addPhoneNew = function () {
    const container = document.getElementById('newPhoneNumbers');

    if (container.children.length >= 3) {
        showToast('Maximum 3 phone numbers allowed', 'error');
        return;
    }

    const index = container.children.length;

    const div = document.createElement('div');
    div.className = 'phone-item';
    div.dataset.index = index;

    div.innerHTML = `
        <input class="phone-number" placeholder="+947XXXXXXXX">
        <select class="phone-category">
            <option value="MOBILE">Mobile</option>
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
        </select>
        <button class="remove-phone-btn" onclick="this.closest('.phone-item').remove()">
            ✕
        </button>
    `;

    container.appendChild(div);
};

window.removePhoneNew = function () {}

window.saveNewCustomer = async function () {
    const modal = document.getElementById('recordModal');

    // 🔹 Base required elements (scoped to modal)
    const fullNameEl = modal.querySelector('#fullName');
    const emailEl = modal.querySelector('#email');
    const nicEl = modal.querySelector('#nic');
    const customerTypeEl = modal.querySelector('#customerType');
    const areaCodeEl = modal.querySelector('#areaCode');

    // 🔒 Safety check
    if (!fullNameEl || !emailEl || !nicEl || !customerTypeEl || !areaCodeEl) {
        showToast('Form is not ready. Please reopen the dialog.', 'error');
        return;
    }

    // 🔹 Build base payload
    const payload = {
        fullName: fullNameEl.value.trim(),
        email: emailEl.value.trim(),
        nic: nicEl.value.trim(),
        areaCode: areaCodeEl.value,
        addressLine1: modal.querySelector('#addressLine1')?.value?.trim() || '',
        addressLine2: modal.querySelector('#addressLine2')?.value?.trim() || '',
        addressCity: modal.querySelector('#addressCity')?.value?.trim() || '',
        addressPostalCode: modal.querySelector('#addressPostalCode')?.value?.trim() || '',
        customerType: customerTypeEl.value,
        phoneNumbers: []
    };

    // 🔹 Basic validation
    if (!payload.fullName || !payload.email || !payload.nic || !payload.customerType) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // 🔹 Phone numbers
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

    // 🔹 Customer-type–specific fields
    if (payload.customerType === 'HOUSEHOLD') {
        const sizeEl = modal.querySelector('#householdSize');
        if (!sizeEl || !sizeEl.value) {
            showToast('Household size is required', 'error');
            return;
        }
        payload.householdSize = parseInt(sizeEl.value, 10);
    }

    if (payload.customerType === 'BUSINESS') {
        const businessType = modal.querySelector('#businessType')?.value?.trim();
        const businessRegiNum = modal.querySelector('#businessRegiNum')?.value?.trim();
        const taxId = modal.querySelector('#taxId')?.value?.trim();

        if (!businessType || !businessRegiNum || !taxId) {
            showToast('Please fill all business details', 'error');
            return;
        }

        payload.businessType = businessType;
        payload.businessRegiNum = businessRegiNum;
        payload.taxId = taxId;
    }

    if (payload.customerType === 'GOVERNMENT ORGANIZATION') {
        const governmentId = modal.querySelector('#governmentId')?.value?.trim();
        const department = modal.querySelector('#department')?.value?.trim();

        if (!governmentId || !department) {
            showToast('Please fill all government details', 'error');
            return;
        }

        payload.governmentId = governmentId;
        payload.department = department;
    }

    // 🔹 Submit
    try {
        const response = await fetch('/customers/full', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let message = 'Failed to create customer';
            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}
            showToast(message, 'error');
            return;
        }

        // ✅ Success
        closeModal();
        showToast('Customer added successfully', 'success');
        fetchCustomers();

    } catch (err) {
        console.error(err);
        showToast('Unexpected error occurred', 'error');
    }
};



window.viewRecord = async function (id) {
    try {
        const response = await fetch(`/customers/${id}`, {
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

        let typeSpecificHtml = '';

        if (record.customerType === 'HOUSEHOLD') {
            typeSpecificHtml = `
                <div class="detail-item">
                    <span class="detail-label">Household Size</span>
                    <span class="detail-value" id="field-householdSize">${record.householdSize}</span>
                </div>`;
        }

        if (record.customerType === 'BUSINESS') {
            typeSpecificHtml = `
                <div class="detail-item">
                    <span class="detail-label">Business Type</span>
                    <span class="detail-value" id="field-businessType">${record.businessType}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Business Reg No</span>
                    <span class="detail-value" id="field-businessRegiNum">${record.businessRegiNum}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tax ID</span>
                    <span class="detail-value" id="field-taxId">${record.taxId}</span>
                </div>`;
        }

        if (record.customerType === 'GOVERNMENT ORGANIZATION') {
            typeSpecificHtml = `
                <div class="detail-item">
                    <span class="detail-label">Government ID</span>
                    <span class="detail-value" id="field-governmentId">${record.governmentId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Department</span>
                    <span class="detail-value" id="field-department">${record.department}</span>
                </div>`;
        }

        let editButtonHtml = '';
        let deleteButtonHtml = '';
        let statusButtonHtml = '';
        let resetPasswordButtonHtml = '';
        let advancedSectionHtml = '';


        if (hasPermission('DELETE_CUSTOMER')) {
            deleteButtonHtml = `<button class="btn-adv btn-delete" onclick="deleteRecord(${record.userId})">Delete Record</button>`;
        } else {
            deleteButtonHtml = '';
        }

        if (hasPermission('UPDATE_CUSTOMER')) {
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

        
        if (hasPermission('UPDATE_CUSTOMER') || hasPermission('DELETE_CUSTOMER')) {
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
                        <div class="detail-value phone-numbers" id="phoneNumbers">
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
                            <span class="detail-label">Address Line 1</span>
                            <span class="detail-value" id="field-address1">${record.addressLine1}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Address Line 2</span>
                            <span class="detail-value" id="field-address2">${record.addressLine2 || ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">City</span>
                            <span class="detail-value" id="field-city">${record.addressCity}</span>
                        </div>
                    </div>

                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Area Code</span>
                            <span class="detail-value" id="field-areaCode">${record.areaCode}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Postal Code</span>
                            <span class="detail-value" id="field-postalCode">${record.addressPostalCode || ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Customer Type</span>
                            <span class="detail-value" id="field-customerType">${record.customerType}</span>
                        </div>
                    </div>

                    <div>
                        ${typeSpecificHtml}
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

    const editableFields = ['name', 'email', 'nic', 'areaCode', 'address1', 'address2', 'city', 'postalCode',
        'householdSize', 'businessType', 'businessRegiNum', 'taxId', 'governmentId', 'department'];

    let areas = [];
    try {
        areas = await fetchAreas();
    } catch (e) {
        console.error(e);
        showToast('Failed to load area codes', 'error');
    }

    editableFields.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        if (!element) return;
        const value = element.textContent;

        if (field === 'areaCode') {
            element.innerHTML = `
                <select style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--gray-50); color: var(--text-primary);">
                    ${areas.map(area => `
                        <option value="${area.areaCode}"
                            ${area.areaCode === value ? 'selected' : ''}>
                            ${area.areaCode} - ${area.areaName}
                        </option>
                    `).join('')}
                </select>
            `;
        } else if (field === 'householdSize') {
            element.innerHTML = `
                <input
                    type="number"
                    min="1"
                    step="1"
                    value="${value}"
                    style="width:100%; padding:8px;"
                >
            `;
        } else {
            element.innerHTML = `<input type="text" value="${value}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--gray-50); color: var(--text-primary);">`;
        }
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
        // 🔹 Collect edited fields
        const payload = {
            fullName: document.querySelector('#field-name input').value.trim(),
            email: document.querySelector('#field-email input').value.trim(),
            nic: document.querySelector('#field-nic input').value.trim(),
            areaCode: document.querySelector('#field-areaCode select').value,
            addressLine1: document.querySelector('#field-address1 input').value.trim(),
            addressLine2: document.querySelector('#field-address2 input').value.trim(),
            addressCity: document.querySelector('#field-city input').value.trim(),
            addressPostalCode: document.querySelector('#field-postalCode input').value.trim(),
            phoneNumbers: []
        };

        const customerType =
            document.getElementById('field-customerType').textContent.trim();

        if (customerType === 'HOUSEHOLD') {
            payload.householdSize =
                parseInt(document.querySelector('#field-householdSize input').value, 10);
        }

        if (customerType === 'BUSINESS') {
            payload.businessType =
                document.querySelector('#field-businessType input').value.trim();
            payload.businessRegiNum =
                document.querySelector('#field-businessRegiNum input').value.trim();
            payload.taxId =
                document.querySelector('#field-taxId input').value.trim();
        }

        if (customerType === 'GOVERNMENT ORGANIZATION') {
            payload.governmentId =
                document.querySelector('#field-governmentId input').value.trim();
            payload.department =
                document.querySelector('#field-department input').value.trim();
        }

        // 🔹 Phones
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

        // 🔹 Remove empty optional fields (clean PATCH)
        Object.keys(payload).forEach(key => {
            if (
                payload[key] === '' ||
                (Array.isArray(payload[key]) && payload[key].length === 0)
            ) {
                delete payload[key];
            }
        });

        console.log('PATCH PAYLOAD:', payload); // 🔍 debug

        // 🔹 API call
        const response = await fetch(`/customers/${id}`, {
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

        // ✅ Success
        closeModal();
        showToast('Record updated successfully', 'success');

        // 🔄 Refresh table
        fetchCustomers();

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while saving record', 'error');
    }
};

window.deleteRecord = async function (id) {
    const result = await showConfirmModal({
        title: 'Delete Customer',
        message: 'Are you sure you want to permanently delete this customer? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true
    });

    if (!result || !result.confirmed) {
        viewRecord(id);
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/customers/${id}`, {
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
            } catch (_) {
                // no body (204 or empty)
            }

            result.close();
            showToast(message, 'error');
            return;
        }

        // ✅ Success
        result.close();
        showToast('Record deleted successfully', 'success');

        // 🔄 Refresh table
        fetchCustomers();

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while deleting record', 'error');
    }
};


window.toggleExpandable = function() {
    const content = document.getElementById('expandableContent');
    const icon = document.getElementById('expandIcon');

    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
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
        viewRecord(id);
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/customers/${id}/activate`, {
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
            } catch (_) {
                // no body (204 or empty)
            }

            result.close();
            showToast(message, 'error');
            return;
        }

        // ✅ Success
        result.close();
        showToast('Account activated successfully', 'success');

        // 🔄 Refresh table
        fetchCustomers();

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
        viewRecord(id);
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/customers/${id}/deactivate`, {
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
            } catch (_) {
                // no body (204 or empty)
            }

            result.close();
            showToast(message, 'error');
            return;
        }

        // ✅ Success
        result.close();
        showToast('Account deactivated successfully', 'success');

        // 🔄 Refresh table
        fetchCustomers();

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while deactivating account', 'error');
    }
};

window.resetPassword = async function (id) {
    const result = await showConfirmModal({
        title: 'Reset Password',
        message:
            'The existing password will be invalidated, and a new password will be generated and sent to the user’s email address.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        danger: false
    });

    // ❌ User cancelled
    if (!result || !result.confirmed) {
        viewRecord(id);
        return;
    }

    // 🔒 Lock modal + show loading state
    result.setLoading();

    try {
        const response = await fetch(`/customers/${id}/reset-password`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        // 🔐 Token expired handling
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

        // ✅ Success
        result.close();
        showToast('Password reset email sent', 'success');

    } catch (err) {
        console.error(err);
        result.close();
        showToast('Unexpected error while resetting password', 'error');
    }
};


function hasPermission(permission) {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || [];
    return permissions.includes(permission);
}

window.closeModal = function() {
    const modal = document.getElementById('recordModal');

    // ❌ Do NOT close if this is a confirm modal
    if (modal.classList.contains('modal-confirm')) {
        return;
    }

    modal.classList.remove('active');
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    isEditMode = false;
    currentEditRecord = null;
};

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function showConfirmModal({
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'OK',
    cancelText = 'Cancel',
    danger = false
}) {
    return new Promise(resolve => {
        const modal = document.getElementById('recordModal');
        const overlay = document.getElementById('modalOverlay');

        modal.classList.add('modal-confirm');

        modal.innerHTML = `
            <div class="modal-header">
                <img src="../../images/${danger ? 'warning-icon.svg' : 'save-icon.svg'}" alt="Confirm">
                <h3>${title}</h3>
            </div>

            <div class="modal-body">
                <p class="confirm-text">
                    ${message}
                </p>
            </div>

            <div class="modal-footer">
                <button class="btn-conf ${danger ? 'btn-delete' : 'btn-save'}" id="confirmOkBtn">
                    ${confirmText}
                </button>
                <button class="btn-conf btn-secondary" id="confirmCancelBtn">
                    ${cancelText}
                </button>
            </div>
        `;

        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        cancelBtn.onclick = () => {
            cleanup();
            resolve({ confirmed: false });
        };

        okBtn.onclick = () => {
            resolve({
                confirmed: true,
                setLoading,
                close: cleanup
            });
        };

        function setLoading() {
            okBtn.disabled = true;
            cancelBtn.disabled = true;

            okBtn.innerHTML = `
                <span class="dot-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            `;
        }
        
        function cleanup(result) {
            modal.classList.remove('active', 'modal-confirm');
            overlay.classList.remove('active');
            resolve(result);
        }

        modal.classList.add('active');
        overlay.classList.add('active');
    });
}

function handleTokenExpired() {
    return new Promise(resolve => {
        const modal = document.getElementById('recordModal');
        const overlay = document.getElementById('modalOverlay');

        modal.classList.add('modal-confirm');

        modal.innerHTML = `
            <div class="modal-header">
                <img src="../../images/warning-icon.svg" alt="Confirm">
                <h3>Token Expired!</h3>
            </div>

            <div class="modal-body">
                <p class="confirm-text">
                    Access token expired. You need to login again.
                </p>
            </div>

            <div class="modal-footer">
                <button class="btn-conf btn-edit" id="confirmOkBtn">
                    OK
                </button>
            </div>
        `;

        function cleanup(result) {
            modal.classList.remove('active', 'modal-confirm');
            overlay.classList.remove('active');
            resolve(result);
        }

        document.getElementById('confirmOkBtn').onclick = () => cleanup(true);

        modal.classList.add('active');
        overlay.classList.add('active');
    });
}

async function refreshCustomers() {
    const btn = document.getElementById('refreshBtn');
    const img = btn?.querySelector('img');

    if (!btn || !img) return;

    btn.disabled = true;
    btn.classList.add('spinning');

    const startTime = Date.now();

    const success = await fetchCustomers(); // ✅ capture result

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