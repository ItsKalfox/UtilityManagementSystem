let currentPage = 0;
const pageSize = 20;

let searchTerm = '';
let filterType = 'all';
let filterStatus = 'all';
let sortBy = 'userId';
let sortDirection = 'asc';
let cachedAreas = null;
let linkedUserId = null;
let nicCheckInProgress = false;
let lastCheckedNic = null;

async function fetchAreas() {
    if (cachedAreas) return cachedAreas;

    const response = await fetch('/api/list/areas', {
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
        const response = await fetch(`/meter-reading/customers`, {
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
            let message = 'Failed to fetch customer';
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
        showToast('Unexpected error while fetching customer', 'error');
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
                <button class="btn btn-view" style="margin: 0 15px 0 0;"
                    onclick="viewRecord(${record.userId})">
                   Customer Details
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

    applyPermissionVisibility('addCustomerBtn', 'CREATE_CUSTOMER');

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

    linkedUserId = null;

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
                    <div class="info-box">
                        <div style="display: flex; gap: 10px;">
                            <img src="../../images/info-icon.svg" alt="Info" style="width: 18px; height: 18px; margin-top: 2px; filter: var(--icon-filter); transition: filter 0.3s ease;">
                            <h4>How customer creation works</h4>
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
        const response = await fetch(`/customers/check-nic/${nic}`, {
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

        if (data.exists && data.hasCustomerProfile) {
            showToast('Customer already exists.', 'error');

            nicInput.value = '';
            nicInput.focus();

            resetIdentityFields();
            lastCheckedNic = null;

            return;
        }

        if (data.exists && !data.hasCustomerProfile && data.userId) {
            const result = await showConfirmModal({
                title: 'Details Found',
                message: 'An existing user was found with this NIC. Do you want to link to this user and create a customer profile?',
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

window.saveNewCustomer = async function () {
    const modal = document.getElementById('recordModal');

    const fullNameEl = modal.querySelector('#fullName');
    const emailEl = modal.querySelector('#email');
    const nicEl = modal.querySelector('#nic');
    const customerTypeEl = modal.querySelector('#customerType');
    const areaCodeEl = modal.querySelector('#areaCode');

    if (!fullNameEl || !emailEl || !nicEl || !customerTypeEl || !areaCodeEl) {
        showToast('Form is not ready. Please reopen the dialog.', 'error');
        return;
    }

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

    if (!payload.fullName || !payload.email || !payload.nic || !payload.customerType) {
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

    const isExistingUser = linkedUserId !== null;

    const endpoint = isExistingUser
        ? '/customers'
        : '/customers/full';

    if (isExistingUser) {
        payload.customerId = linkedUserId;
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
            let message = 'Failed to create customer';
            try {
                const err = await response.json();
                if (err.message) message = err.message;
            } catch {}
            showToast(message, 'error');
            return;
        }

        const record = await response.json();

        closeModal();
        showToast('Customer added successfully', 'success');
        fetchCustomers();
        viewRecord(record.userId);

    } catch (err) {
        console.error(err);
        showToast('Unexpected error while creating customer', 'error');
    }
};

//document.addEventListener()

window.showAddReadingPopup = async function (id) {
    try {
        const response = await  fetch(`/meter-reading/get-details/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        let data;
        if (response.status === 401) {
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
        console.log("get details", record);

        const modal = document.getElementById('recordModal');
        const overlay = document.getElementById('modalOverlay');

        /* =========================
           BUILD OPTIONS HTML
        ========================= */
        const meterOptions = record.meters.length === 0
            ? `<option disabled>No meters found</option>`
            : record.meters
                .map(meter => `
            <option value="${meter.connection_id}">
                ${meter.meter_serial_number}
            </option>
        `)
                .join("");

        let lastReadingHtml = `
    <div class="record-item">
        <div class="record-nic">Meter No</div>
        <div class="record-nic">Reading</div>
        <div class="record-nic">Consumption</div>
        <div class="record-nic">Period</div>
    </div>
`;

        if (Object.keys(record.last_reading).length === 0) {
            lastReadingHtml += `
        <div class="record-item">
            <div class="record-nic" style="grid-column: span 4; text-align: center;">
                No meters found
            </div>
        </div>
    `;
        } else {
            Object.values(record.last_reading).forEach(reading => {
                lastReadingHtml += `
            <div class="record-item">
                <div class="record-nic">${reading.meter_serial_number}</div>
                <div class="record-nic">${reading.reading_value}</div>
                <div class="record-nic">${reading.consumption}</div>
                <div class="record-nic">
                    ${new Date(reading.billing_period_start).toLocaleString()}
                    →
                    ${new Date(reading.billing_period_end).toLocaleString()}
                </div>
            </div>
        `;
            });
        }


        /* =========================
           MODAL HTML
        ========================= */
        const fieldOfficerId = parseInt(localStorage.getItem("userId"));
        const stringData = JSON.stringify(record);

        modal.innerHTML = `
    <div class="modal-header">
        <h3>Add Reading</h3>
        <input class="" value=${stringData} hidden id="recordDataString">
        <button class="close-btn" onclick="closeModal()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
        </button>
    </div>

    <div class="modal-body">
        <div class="detail-item">
            <span class="detail-label">Select Meter</span>
            <select class="filter-select" id="connectionIdSelector">
                ${meterOptions}
            </select>
        </div>
        <div class="detail-item">
        
        <span class="detail-label" style="margin-top: 20px;">Last Reading Value</span>
          ${lastReadingHtml}
        </div>
        <div class="detail-item" style="margin-top: 10px;">
            <span class="detail-label">Current Reading Value</span>
            <input type="number" class="detail-value detail-input" id="currectReadingValue">
        </div>
        <div class="" id="modelWaringText"></div>
        <input hidden id="fieldOfficerId" type="number" value=${fieldOfficerId}>   
    </div>
    <div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-save" onclick="saveMeterReading()">Save</button>
        </div>
    </div>  
`;

        modal.classList.add('active');
        overlay.classList.add('active');


    }
    catch (e) {
        console.error(e);
        showToast('Unexpected error', 'error');
    }
}

window.saveMeterReading = async function (){
    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    const connectionId = document.getElementById("connectionIdSelector").value;
    let readingValue = document.getElementById("currectReadingValue").value;
    readingValue = parseInt(readingValue);
    const recordDataString = document.getElementById("recordDataString").value;
    const data = JSON.parse(recordDataString);
    const modelWarning = document.getElementById("modelWaringText");
    const fieldOfficerId = parseInt(document.getElementById("fieldOfficerId").value);

    const previous_reading_val = data.last_reading[connectionId].reading_value
    let consumption = readingValue - previous_reading_val;
// START DATE (already correct)
    let start_date = data.last_reading[connectionId]?.billing_period_end
        ?? new Date().toISOString().replace('Z', '+00:00');

// END DATE (match format exactly)
    let end_date = new Date().toISOString().replace('Z', '+00:00');




    if (previous_reading_val < readingValue) {
        console.log("ok")
        const response = await  fetch(`/meter-reading/add`, {
            method:"POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                connection_id: connectionId,
                field_officer_id: fieldOfficerId,
                reading_value: readingValue,
                consumption: consumption,
                billing_period_start: start_date,
                billing_period_end: end_date,
            })
        })
        const _data = response.json();
        if (_data) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        }
        console.log("returned", _data);
        modelWarning.innerHTML = "";

    } else {
        modelWarning.innerHTML = `Current reading value must be greter than ${previous_reading_val}`
    }

    console.log(connectionId, readingValue, data);


}

window.viewHistory = async function (id) {
    try {
        const response = await  fetch(`/meter-reading/history/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        let data;
        if (response.status === 401) {
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
        console.log("test response", record);

        const modal = document.getElementById('recordModal');
        const overlay = document.getElementById('modalOverlay');

        /* =========================
           METER READINGS HTML
        ========================= */
        let meterReadingsHtml = `
    <div class="record-item">
        <div class="record-nic">Meter No</div>
        <div class="record-nic">Reading</div>
        <div class="record-nic">Consumption</div>
        <div class="record-nic">Period</div>
    </div>
`;

        if (record.meterReadings.length === 0) {
            meterReadingsHtml += `
        <div class="record-item">
            <div class="record-nic" style="grid-column: span 4; text-align: center;">
                No meter readings found
            </div>
        </div>
    `;
        } else {
            record.meterReadings.forEach(reading => {
                meterReadingsHtml += `
            <div class="record-item">
                <div class="record-nic">${reading.meter_serial_number}</div>
                <div class="record-nic">${reading.reading_value}</div>
                <div class="record-nic">${reading.consumption}</div>
                <div class="record-nic">
                    ${new Date(reading.billing_period_start).toLocaleString()}
                    →
                    ${new Date(reading.billing_period_end).toLocaleString()}
                </div>
            </div>
        `;
            });
        }



        /* =========================
           BILL HISTORY HTML
        ========================= */
        let billsHtml = `
    <div class="record-item">
        <div class="record-nic">Bill ID</div>
        <div class="record-nic">Total</div>
        <div class="record-nic">Outstanding</div>
        <div class="record-nic">Status</div>
    </div>
`;

        if (record.bills.length === 0) {
            billsHtml += `
        <div class="record-item">
            <div class="record-nic" style="grid-column: span 4; text-align: center;">
                No bills found
            </div>
        </div>
    `;
        } else {
            record.bills.forEach(bill => {
                billsHtml += `
            <div class="record-item">
                <div class="record-nic">${bill.bill_id}</div>
                <div class="record-nic">${bill.total_bill_amount}</div>
                <div class="record-nic">${bill.outstanding_amount}</div>
                <div class="record-nic">${bill.status}</div>
            </div>
        `;
            });
        }



        modal.innerHTML = `
    <div class="modal-header">
        <h3>History</h3>
        <button class="close-btn" onclick="closeModal()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
        </button>
    </div>

    <div class="modal-body">
        <h4>Meter Reading History</h4>
        <div class="records-container">
            ${meterReadingsHtml || '<div class="record-item">No meter readings found</div>'}
        </div>

        <h4 style="margin-top: 10px;">Billing History</h4>
        <div class="records-container">
            ${billsHtml || '<div class="record-item">No bills found</div>'}
        </div>
    </div>
`;

        modal.classList.add('active');
        overlay.classList.add('active');


    }
    catch (e) {
        console.error(e);
        showToast('Unexpected error', 'error');
    }
}


window.viewRecord = async function (id) {
    try {
        const response = await fetch(`/meter-reading/customers/${id}`, {
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
            editButtonHtml = ``;
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
                   `;
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

        closeModal();
        showToast('Record updated successfully', 'success');

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
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        showToast('Record deleted successfully', 'success');
        closeModal();

        fetchCustomers();

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
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        closeModal();
        showToast('Account activated successfully', 'success');

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
            } catch (_) { }

            result.close();
            showToast(message, 'error');
            return;
        }

        result.close();
        closeModal();
        showToast('Account deactivated successfully', 'success');

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

    if (!result || !result.confirmed) {
        return;
    }

    result.setLoading();

    try {
        const response = await fetch(`/customers/${id}/reset-password`, {
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

async function refreshCustomers() {
    const btn = document.getElementById('refreshBtn');
    const img = btn?.querySelector('img');

    if (!btn || !img) return;

    btn.disabled = true;
    btn.classList.add('spinning');

    const startTime = Date.now();

    const success = await fetchCustomers();

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