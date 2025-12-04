CREATE DATABASE ums_dev;

USE ums_dev;

CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    nic VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('ACTIVE', 'DEACTIVE')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE PhoneNumber (
    phone_number_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    number_type VARCHAR(20) NOT NULL CHECK (number_type IN ('MOBILE', 'HOME', 'WORK')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Area (
    area_code VARCHAR(10) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL
);

CREATE TABLE Customer (
    user_id INT PRIMARY KEY,
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('HOUSEHOLD', 'BUSINESS', 'GOVERNMENT ORGANIZATION')),
    area_code VARCHAR(10) NOT NULL,
    address_line1 VARCHAR(120) NOT NULL,
    address_line2 VARCHAR(120),
    address_city VARCHAR(60) NOT NULL,
    address_postal_code VARCHAR(20),

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (area_code) REFERENCES Area(area_code)
);

CREATE TABLE Household (
    customer_id INT PRIMARY KEY,
    household_size INT NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

CREATE TABLE Business (
    customer_id INT PRIMARY KEY,
    tax_id VARCHAR(50),
    business_regi_num VARCHAR(50),
    business_type VARCHAR(100),

    FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

CREATE TABLE GovernmentOrganization (
    customer_id INT PRIMARY KEY,
    government_id VARCHAR(50),
    department VARCHAR(100),

    FOREIGN KEY (customer_id) REFERENCES Customer(user_id)
);

CREATE TABLE Manager (
    user_id INT PRIMARY KEY,
    department VARCHAR(100),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Cashier (
    user_id INT PRIMARY KEY,
    branch_name VARCHAR(120),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE FieldOfficer (
    user_id INT PRIMARY KEY,
    area_code VARCHAR(10),
    vehicle_no VARCHAR(20),

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (area_code) REFERENCES Area(area_code)
);

CREATE TABLE Role (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Permission (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE RolePermission (
    role_permission_id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Role(role_id),
    FOREIGN KEY (permission_id) REFERENCES Permission(permission_id)
);

CREATE TABLE Admin (
    user_id INT PRIMARY KEY,
    role_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

CREATE TABLE AdminActionLog (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    admin_id INT NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE','DELETE','UPDATE','ADD')),
    time_stamp DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (admin_id) REFERENCES Admin(user_id)
);