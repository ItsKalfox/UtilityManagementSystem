let currentTab = 'dashboard';
let currentPage = 1;
let isEditMode = false;
let currentEditRecord = null;

const mockCustomers = [];
const mockManagers = [];
const mockCashiers = [];
const mockOfficers = [];

for (let i = 1; i <= 50; i++) {
    mockCustomers.push({
        id: i,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        nic: `NIC${String(i).padStart(6, '0')}`,
        status: i % 3 === 0 ? 'inactive' : 'active',
        createdDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        updatedDate: `2024-12-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        areaCode: 'A00' + (i % 5 + 1),
        address1: `${i} Main Street`,
        address2: `Building ${i}`,
        city: ['Colombo', 'Kandy', 'Galle', 'Jaffna'][i % 4],
        postalCode: String(10000 + i),
        customerType: ['Household', 'Business', 'Government'][i % 3],
        phones: [
            { number: `077${String(i).padStart(7, '0')}`, category: 'mobile' },
            { number: `011${String(i).padStart(7, '0')}`, category: 'home' }
        ]
    });
}

for (let i = 1; i <= 30; i++) {
    mockManagers.push({
        id: i,
        name: `Manager ${i}`,
        email: `manager${i}@ums.com`,
        nic: `MNIC${String(i).padStart(5, '0')}`,
        status: i % 4 === 0 ? 'inactive' : 'active',
        createdDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        updatedDate: `2024-12-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        areaCode: 'A00' + (i % 5 + 1),
        address1: `${i} Manager Avenue`,
        address2: `Office ${i}`,
        city: ['Colombo', 'Kandy', 'Galle'][i % 3],
        postalCode: String(20000 + i),
        customerType: 'Staff',
        phones: [
            { number: `071${String(i).padStart(7, '0')}`, category: 'mobile' }
        ]
    });
}

for (let i = 1; i <= 40; i++) {
    mockCashiers.push({
        id: i,
        name: `Cashier ${i}`,
        email: `cashier${i}@ums.com`,
        nic: `CNIC${String(i).padStart(5, '0')}`,
        status: i % 5 === 0 ? 'inactive' : 'active',
        createdDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        updatedDate: `2024-12-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        areaCode: 'A00' + (i % 5 + 1),
        address1: `${i} Cashier Lane`,
        address2: `Counter ${i}`,
        city: ['Colombo', 'Kandy', 'Galle', 'Jaffna'][i % 4],
        postalCode: String(30000 + i),
        customerType: 'Staff',
        phones: [
            { number: `072${String(i).padStart(7, '0')}`, category: 'mobile' }
        ]
    });
}

for (let i = 1; i <= 35; i++) {
    mockOfficers.push({
        id: i,
        name: `Field Officer ${i}`,
        email: `officer${i}@ums.com`,
        nic: `ONIC${String(i).padStart(5, '0')}`,
        status: i % 4 === 0 ? 'inactive' : 'active',
        createdDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        updatedDate: `2024-12-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        areaCode: 'A00' + (i % 5 + 1),
        address1: `${i} Field Road`,
        address2: `Unit ${i}`,
        city: ['Colombo', 'Kandy', 'Galle', 'Jaffna'][i % 4],
        postalCode: String(40000 + i),
        customerType: 'Staff',
        phones: [
            { number: `075${String(i).padStart(7, '0')}`, category: 'mobile' },
            { number: `011${String(i).padStart(7, '0')}`, category: 'work' }
        ]
    });
}

function initDashboard() {
    const userName = localStorage.getItem('fullName') || 'Admin User';
    const userEmail = localStorage.getItem('email') || 'admin@ums.com';
    const userRole = localStorage.getItem('adminRole') || 'admin';

    document.getElementById('userName').textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userRole').textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('-', ' ');
    document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();

    setupNavigation();
    showTab('dashboard');
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            showTab(tab);
        });
    });
}

function showTab(tab) {
    currentTab = tab;
    currentPage = 1;
    const contentArea = document.getElementById('contentArea');

    switch(tab) {
        case 'dashboard':
            contentArea.innerHTML = getDashboardContent();
            break;
        case 'customers':
            contentArea.innerHTML = getManagementContent('Customer', mockCustomers);
            setupManagementHandlers('customers', mockCustomers);
            break;
        case 'managers':
            contentArea.innerHTML = getManagementContent('Manager', mockManagers);
            setupManagementHandlers('managers', mockManagers);
            break;
        case 'cashiers':
            contentArea.innerHTML = getManagementContent('Cashier', mockCashiers);
            setupManagementHandlers('cashiers', mockCashiers);
            break;
        case 'officers':
            contentArea.innerHTML = getManagementContent('Field Officer', mockOfficers);
            setupManagementHandlers('officers', mockOfficers);
            break;
        case 'roles':
            contentArea.innerHTML = getRoleCreationContent();
            break;
        case 'areas':
            contentArea.innerHTML = getAreaCreationContent();
            break;
    }
}

function getDashboardContent() {
    return `
        <h2 style="color: var(--text-primary); margin-bottom: 24px; font-size: 1.8rem;">Dashboard Overview</h2>

        <div class="dashboard-stats">
            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                    </svg>
                </span>
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">${mockCustomers.length}</div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                </span>
                <div class="stat-label">Electricity Connections</div>
                <div class="stat-value">324</div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                </span>
                <div class="stat-label">Water Connections</div>
                <div class="stat-value">287</div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>
                </span>
                <div class="stat-label">Gas Connections</div>
                <div class="stat-value">198</div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </span>
                <div class="stat-label">Field Officers</div>
                <div class="stat-value">${mockOfficers.filter(o => o.status === 'active').length}</div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </span>
                <div class="stat-label">Active Staff</div>
                <div class="stat-value">${mockManagers.filter(m => m.status === 'active').length + mockCashiers.filter(c => c.status === 'active').length}</div>
            </div>
        </div>
    `;
}

function getManagementContent(type, data) {
    return `
        <div class="management-container">
            <div class="management-header">
                <h2>${type} Management</h2>

                <div class="management-controls">
                    <div class="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" id="searchInput" placeholder="Search...">
                    </div>

                    <select id="filterSelect" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select id="sortBySelect" class="sort-select">
                        <option value="id">Sort by ID</option>
                        <option value="createdDate">Sort by Created Date</option>
                        <option value="updatedDate">Sort by Updated Date</option>
                    </select>

                    <select id="sortOrderSelect" class="sort-select">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>

            <div class="records-container" id="recordsContainer">
            </div>

            <div class="pagination" id="pagination"></div>
        </div>
    `;
}

function setupManagementHandlers(type, data) {
    let filteredData = [...data];

    function renderRecords() {
        const recordsPerPage = 10;
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        const container = document.getElementById('recordsContainer');
        container.innerHTML = pageData.map(record => `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-id">#${record.id}</div>
                    <div class="record-name">${record.name}</div>
                    <div class="record-nic">${record.nic}</div>
                    <div>
                        <span class="status-badge status-${record.status}">${record.status}</span>
                    </div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-view" onclick="viewRecord('${type}', ${record.id})">Full View</button>
                    <button class="btn btn-delete" onclick="deleteRecord('${type}', ${record.id})">Delete</button>
                </div>
            </div>
        `).join('');

        renderPagination(Math.ceil(filteredData.length / recordsPerPage));
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        let pages = [];

        for (let i = 1; i <= totalPages; i++) {
            pages.push(`
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i}
                </button>
            `);
        }

        pagination.innerHTML = pages.join('');
    }

    window.goToPage = function(page) {
        currentPage = page;
        renderRecords();
    };

    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredData = data.filter(record =>
            record.name.toLowerCase().includes(searchTerm) ||
            record.email.toLowerCase().includes(searchTerm) ||
            record.nic.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        renderRecords();
    });

    document.getElementById('filterSelect').addEventListener('change', (e) => {
        const filterValue = e.target.value;
        if (filterValue === 'all') {
            filteredData = [...data];
        } else {
            filteredData = data.filter(record => record.status === filterValue);
        }
        currentPage = 1;
        renderRecords();
    });

    document.getElementById('sortBySelect').addEventListener('change', applySort);
    document.getElementById('sortOrderSelect').addEventListener('change', applySort);

    function applySort() {
        const sortBy = document.getElementById('sortBySelect').value;
        const sortOrder = document.getElementById('sortOrderSelect').value;

        filteredData.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'id') {
                aVal = parseInt(aVal);
                bVal = parseInt(bVal);
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        renderRecords();
    }

    renderRecords();
}

window.viewRecord = function(type, id) {
    let data;
    switch(type) {
        case 'customers': data = mockCustomers; break;
        case 'managers': data = mockManagers; break;
        case 'cashiers': data = mockCashiers; break;
        case 'officers': data = mockOfficers; break;
    }

    const record = data.find(r => r.id === id);
    if (!record) return;

    currentEditRecord = { ...record };
    isEditMode = false;

    const modal = document.getElementById('recordModal');
    const overlay = document.getElementById('modalOverlay');

    modal.innerHTML = `
        <div class="modal-header">
            <h3>Full Details</h3>
            <button class="close-btn" onclick="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <div class="modal-body">
            <div class="detail-grid" id="detailGrid">
                <div class="detail-item">
                    <span class="detail-label">ID</span>
                    <span class="detail-value">#${record.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Full Name</span>
                    <span class="detail-value" id="field-name">${record.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value" id="field-email">${record.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">NIC</span>
                    <span class="detail-value" id="field-nic">${record.nic}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">
                        <span class="status-badge status-${record.status}">${record.status}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created Date</span>
                    <span class="detail-value">${record.createdDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Updated Date</span>
                    <span class="detail-value">${record.updatedDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Area Code</span>
                    <span class="detail-value" id="field-areaCode">${record.areaCode}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address Line 1</span>
                    <span class="detail-value" id="field-address1">${record.address1}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address Line 2</span>
                    <span class="detail-value" id="field-address2">${record.address2}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">City</span>
                    <span class="detail-value" id="field-city">${record.city}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Postal Code</span>
                    <span class="detail-value" id="field-postalCode">${record.postalCode}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Customer Type</span>
                    <span class="detail-value">${record.customerType}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Phone Numbers</span>
                    <div class="detail-value phone-numbers" id="phoneNumbers">
                        ${record.phones.map((phone, idx) => `
                            <div class="phone-item" data-index="${idx}">
                                <input type="text" value="${phone.number}" class="phone-number" disabled>
                                <select class="phone-category" disabled>
                                    <option value="mobile" ${phone.category === 'mobile' ? 'selected' : ''}>Mobile</option>
                                    <option value="home" ${phone.category === 'home' ? 'selected' : ''}>Home</option>
                                    <option value="work" ${phone.category === 'work' ? 'selected' : ''}>Work</option>
                                </select>
                                <button class="remove-phone-btn" style="display: none;" onclick="removePhone(${idx})">
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
            </div>

            <div class="expandable-section">
                <div class="expandable-header" onclick="toggleExpandable()">
                    <span class="expandable-title">System Access</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="expandIcon">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="expandable-content" id="expandableContent">
                    <div class="system-actions">
                        <button class="btn btn-edit" onclick="activateAccount()">Activate Account</button>
                        <button class="btn btn-secondary" onclick="resetPassword()">Reset Password</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn btn-edit" id="editBtn" onclick="enableEdit()">Edit</button>
            <button class="btn btn-save" id="saveBtn" style="display: none;" onclick="saveRecord('${type}', ${id})">Save</button>
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
};

window.enableEdit = function() {
    isEditMode = true;
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'block';

    const editableFields = ['name', 'email', 'nic', 'areaCode', 'address1', 'address2', 'city', 'postalCode'];

    editableFields.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        const value = element.textContent;

        if (field === 'areaCode') {
            element.innerHTML = `
                <select style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--gray-50); color: var(--text-primary);">
                    <option value="A001" ${value === 'A001' ? 'selected' : ''}>A001</option>
                    <option value="A002" ${value === 'A002' ? 'selected' : ''}>A002</option>
                    <option value="A003" ${value === 'A003' ? 'selected' : ''}>A003</option>
                    <option value="A004" ${value === 'A004' ? 'selected' : ''}>A004</option>
                    <option value="A005" ${value === 'A005' ? 'selected' : ''}>A005</option>
                </select>
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

window.saveRecord = function(type, id) {
    const name = document.querySelector('#field-name input').value;
    const email = document.querySelector('#field-email input').value;
    const nic = document.querySelector('#field-nic input').value;
    const areaCode = document.querySelector('#field-areaCode select').value;
    const address1 = document.querySelector('#field-address1 input').value;
    const address2 = document.querySelector('#field-address2 input').value;
    const city = document.querySelector('#field-city input').value;
    const postalCode = document.querySelector('#field-postalCode input').value;

    const phones = [];
    document.querySelectorAll('.phone-item').forEach(item => {
        const number = item.querySelector('.phone-number').value;
        const category = item.querySelector('.phone-category').value;
        if (number) {
            phones.push({ number, category });
        }
    });

    let data;
    switch(type) {
        case 'customers': data = mockCustomers; break;
        case 'managers': data = mockManagers; break;
        case 'cashiers': data = mockCashiers; break;
        case 'officers': data = mockOfficers; break;
    }

    const record = data.find(r => r.id === id);
    if (record) {
        record.name = name;
        record.email = email;
        record.nic = nic;
        record.areaCode = areaCode;
        record.address1 = address1;
        record.address2 = address2;
        record.city = city;
        record.postalCode = postalCode;
        record.phones = phones;
        record.updatedDate = new Date().toISOString().split('T')[0];
    }

    closeModal();
    showToast('Record updated successfully', 'success');
    showTab(currentTab);
};

window.deleteRecord = function(type, id) {
    if (confirm('Are you sure you want to delete this record?')) {
        let data;
        switch(type) {
            case 'customers':
                const customerIndex = mockCustomers.findIndex(r => r.id === id);
                if (customerIndex > -1) mockCustomers.splice(customerIndex, 1);
                break;
            case 'managers':
                const managerIndex = mockManagers.findIndex(r => r.id === id);
                if (managerIndex > -1) mockManagers.splice(managerIndex, 1);
                break;
            case 'cashiers':
                const cashierIndex = mockCashiers.findIndex(r => r.id === id);
                if (cashierIndex > -1) mockCashiers.splice(cashierIndex, 1);
                break;
            case 'officers':
                const officerIndex = mockOfficers.findIndex(r => r.id === id);
                if (officerIndex > -1) mockOfficers.splice(officerIndex, 1);
                break;
        }

        showToast('Record deleted successfully', 'success');
        showTab(currentTab);
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

window.activateAccount = function() {
    showToast('Account activated successfully', 'success');
};

window.resetPassword = function() {
    showToast('Password reset email sent', 'success');
};

window.closeModal = function() {
    document.getElementById('recordModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    isEditMode = false;
    currentEditRecord = null;
};

function getRoleCreationContent() {
    return `
        <div class="management-container">
            <h2>Role Creation</h2>
            <p style="color: var(--text-secondary); margin-top: 20px;">Role creation interface will be implemented here.</p>
        </div>
    `;
}

function getAreaCreationContent() {
    return `
        <div class="management-container">
            <h2>Area Creation</h2>
            <p style="color: var(--text-secondary); margin-top: 20px;">Area creation interface will be implemented here.</p>
        </div>
    `;
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

window.handleLogout = function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
};

window.handleSettings = function() {
    showToast('Settings feature coming soon', 'success');
};

document.getElementById('modalOverlay').addEventListener('click', closeModal);

initDashboard();
