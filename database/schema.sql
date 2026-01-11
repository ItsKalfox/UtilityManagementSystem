CREATE DATABASE ums_dev;

USE ums_dev;

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    nic VARCHAR(20) UNIQUE NOT NULL,
);

CREATE TABLE phone_number (
    phone_number_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    number_type VARCHAR(20) NOT NULL CHECK (number_type IN ('MOBILE', 'HOME', 'WORK')),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE area (
    area_code VARCHAR(10) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL
);

CREATE TABLE customer (
    user_id INT PRIMARY KEY,
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('HOUSEHOLD', 'BUSINESS', 'GOVERNMENT ORGANIZATION')),
    area_code VARCHAR(10) NOT NULL,
    address_line1 VARCHAR(120) NOT NULL,
    address_line2 VARCHAR(120),
    address_city VARCHAR(60) NOT NULL,
    address_postal_code VARCHAR(20),
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (area_code) REFERENCES area(area_code)
);

CREATE TABLE household (
    customer_id INT PRIMARY KEY,
    household_size INT NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES customer(user_id)
);

CREATE TABLE business (
    customer_id INT PRIMARY KEY,
    tax_id VARCHAR(50),
    business_regi_num VARCHAR(50),
    business_type VARCHAR(100),

    FOREIGN KEY (customer_id) REFERENCES customer(user_id)
);

CREATE TABLE government_organization (
    customer_id INT PRIMARY KEY,
    government_id VARCHAR(50),
    department VARCHAR(100),

    FOREIGN KEY (customer_id) REFERENCES customer(user_id)
);

CREATE TABLE manager (
    user_id INT PRIMARY KEY,
    department VARCHAR(100),
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE cashier (
    user_id INT PRIMARY KEY,
    branch_name VARCHAR(120),
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE field_officer (
    user_id INT PRIMARY KEY,
    area_code VARCHAR(10),
    vehicle_no VARCHAR(20),
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (area_code) REFERENCES area(area_code)
);

CREATE TABLE role (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE permission (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE role_permission (
    role_permission_id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(role_id),
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id)
);

CREATE TABLE admin (
    user_id INT PRIMARY KEY,
    role_id INT NOT NULL,
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE admin_action_log (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    admin_id INT NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    time_stamp DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (admin_id) REFERENCES admin(user_id)
);

CREATE TABLE tariff (
    tariff_id INT IDENTITY(1,1) PRIMARY KEY,
    tariff_name VARCHAR(100) NOT NULL,
    tariff_description VARCHAR(255),
    is_prorated BIT NOT NULL DEFAULT 0,
    fixed_charge DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) NOT NULL,
    utility_type VARCHAR(50) NOT NULL CHECK (utility_type IN ('ELECTRICITY', 'WATER', 'GAS')),
    created_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE tariff_slab (
    slab_id INT IDENTITY(1,1) PRIMARY KEY,
    tariff_id INT NOT NULL,
    slab_order INT NOT NULL,
    start_unit INT NOT NULL, 
    end_unit INT,
    unit_rate DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (tariff_id) REFERENCES tariff(tariff_id)
);

CREATE TABLE utility_connection (
    connection_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    tariff_id INT NOT NULL,
    meter_serial_number VARCHAR(50) UNIQUE NOT NULL,
    utility_type VARCHAR(50) NOT NULL CHECK (utility_type IN ('ELECTRICITY', 'WATER', 'GAS')),
    install_date DATETIME NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),

    FOREIGN KEY (customer_id) REFERENCES customer(user_id),
    FOREIGN KEY (tariff_id) REFERENCES tariff(tariff_id)
);

CREATE TABLE meter_reading (
    reading_id INT IDENTITY(1,1) PRIMARY KEY,
    field_officer_id INT NOT NULL,  -- required entry
    connection_id INT NOT NULL,  -- required entry
    reading_value DECIMAL(10,2) NOT NULL,  -- required entry
    consumption DECIMAL(10,2),
    billing_period_start DATETIME,
    billing_period_end DATETIME,

    FOREIGN KEY (connection_id) REFERENCES utility_connection(connection_id),
    FOREIGN KEY (field_officer_id) REFERENCES field_officer(user_id)
);

CREATE TABLE bill (
    bill_id INT IDENTITY(1,1) PRIMARY KEY,
    connection_id INT NOT NULL,
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    total_bill_amount DECIMAL(10,2) NOT NULL,
    outstanding_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'FULLY PAID', 'PARTIALLY PAID')),

    FOREIGN KEY (connection_id) REFERENCES utility_connection(connection_id)
);

CREATE TABLE payment (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    bill_id INT NOT NULL,
    cashier_id INT NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK TRANSFER')),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (bill_id) REFERENCES bill(bill_id),
    FOREIGN KEY (cashier_id) REFERENCES cashier(user_id)
);

CREATE TABLE cash (
    payment_id INT PRIMARY KEY,
    amount_given DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2),

    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

CREATE TABLE card (
    payment_id INT PRIMARY KEY,
    platform_name VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) NOT NULL CHECK (card_type IN ('CREDIT', 'DEBIT')),
    approval_code VARCHAR(50) NOT NULL,

    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

CREATE TABLE bank_transfer (
    payment_id INT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    transaction_num VARCHAR(50) NOT NULL,

    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

CREATE TABLE complaint (
    complaint_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    field_officer_id INT NOT NULL,
    admin_id INT NOT NULL,
    complaint_type VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    submitted_date DATETIME DEFAULT GETDATE(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'IN PROGRESS', 'RESOLVED')),
    resolved_date DATETIME,
    resolution_notes VARCHAR(500),

    FOREIGN KEY (customer_id) REFERENCES customer(user_id),
    FOREIGN KEY (field_officer_id) REFERENCES field_officer(user_id),
    FOREIGN KEY (admin_id) REFERENCES admin(user_id)
);