INSERT INTO users
    (full_name, email, nic)
VALUES
    ('Super Admin', 'superadmin@example.com', '200312345678'),
    ('View Admin', 'viewadmin@example.com', '200313345678'),
    ('Edit Admin', 'editadmin@example.com', '200314345678'),
    ('Delete Admin', 'deleteadmin@example.com', '200315345678'),
    ('Update Admin', 'updateadmin@example.com', '200316345678'),
    ('Manager One', 'managerone@example.com', '200317345678'),
    ('Manager Two', 'managertwo@example.com', '200318345678'),
    ('FieldOfficer One', 'fieldofficerone@example.com', '200319345678'),
    ('FieldOfficer Two', 'fieldofficertwo@example.com', '200320345678'),
    ('Cashier One', 'cashierone@example.com', '200321345678'),
    ('Cashier Two', 'cashiertwo@example.com', '200322345678'),
    ('Customer One', 'customerone@example.com', '200323345678'),
    ('Customer Two', 'customertwo@example.com', '200324345678'),
    ('Customer Three', 'customerthree@example.com', '200325345678'),
    ('Customer Four', 'customerfour@example.com', '200326345678'),
    ('Customer Five', 'customerfive@example.com', '200327345678'),
    ('Customer Six', 'customersix@example.com', '200328345678'),
    ('Admin Manager', 'adminmanager@example.com', '200328345679');

INSERT INTO phone_number
VALUES
    (1, '+94771234567', 'MOBILE'),
    (1, '+94112345678', 'HOME'),
    (1, '+94115345678', 'WORK'),
    (2, '+94759876543', 'MOBILE'),
    (3, '+94712223344', 'MOBILE'),
    (3, '+94112345678', 'HOME'),
    (3, '+94115678901', 'WORK'),
    (4, '+94764433221', 'MOBILE'),
    (5, '+94725556677', 'MOBILE'),
    (5, '+94119988776', 'WORK'),
    (6, '+94784433556', 'MOBILE'),
    (7, '+94702233445', 'MOBILE'),
    (7, '+94111112222', 'HOME'),
    (8, '+94717788990', 'MOBILE'),
    (9, '+94773344556', 'MOBILE'),
    (10, '+94759900887', 'MOBILE'),
    (10, '+94759900887', 'HOME'),
    (10, '+94759900887', 'WORK'),
    (11, '+94746655443', 'MOBILE'),
    (12, '+94723344556', 'MOBILE'),
    (13, '+94734455667', 'MOBILE'),
    (14, '+94765566778', 'MOBILE'),
    (15, '+94776677889', 'MOBILE'),
    (16, '+94787788990', 'MOBILE'),
    (17, '+94798899001', 'MOBILE'),
    (18, '+94711223344', 'MOBILE');

INSERT INTO area
VALUES
    ('A001', 'Colombo 01'),
    ('A002', 'Colombo 02'),
    ('A003', 'Colombo 03'),
    ('A004', 'Gampaha'),
    ('A005', 'Kandy'),
    ('A006', 'Matara'),
    ('A007', 'Galle'),
    ('A008', 'Jaffna'),
    ('A009', 'Negombo'),
    ('A010', 'Kotte');

INSERT INTO customer
    (user_id, customer_type, area_code, address_line1, address_line2, address_city, address_postal_code, status, created_at, updated_at)
VALUES
    (12, 'HOUSEHOLD', 'A001', '12 Flower Rd', 'Lane 3', 'Colombo', '10001', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (13, 'BUSINESS', 'A002', '88 Main Street', 'Lane 3', 'Colombo', '10002', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (14, 'GOVERNMENT ORGANIZATION', 'A003', '22 State Building', 'Floor 2', 'Colombo', '10003', 'ACTIVE', '2025-12-11 12:48:37.553', '2025-12-22 12:48:37.553'),
    (15, 'HOUSEHOLD', 'A004', '55 Lake Rd', 'Lane 3', 'Gampaha', '11000', 'INACTIVE', '2025-12-12 12:48:37.553', '2025-12-20 12:48:37.553'),
    (16, 'BUSINESS', 'A005', '97 Temple Rd', 'Lane 3', 'Kandy', '20000', 'ACTIVE', '2025-12-13 12:48:37.553', '2025-12-19 12:48:37.553'),
    (17, 'GOVERNMENT ORGANIZATION', 'A006', '101 Beach Rd', 'Lane 3', 'Matara', '81000', 'ACTIVE', '2025-12-14 12:48:37.553', '2025-12-17 12:48:37.553');

INSERT INTO household
VALUES
    (12, 4),
    (15, 3);

INSERT INTO business
VALUES
    (13, 'TAX-2345', 'BR-5566', 'Retail'),
    (16, 'TAX-8833', 'BR-2288', 'Automotive');

INSERT INTO government_organization
VALUES
    (14, 'GOV-1122', 'Transport Dept'),
    (17, 'GOV-8899', 'Health Division');

INSERT INTO manager
    (user_id, department, status, created_at, updated_at)
VALUES
    (6, 'Finance', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (7, 'HR', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (18, 'Operations', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553');

INSERT INTO cashier
    (user_id, branch_name, status, created_at, updated_at)
VALUES
    (10, 'Main Branch', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (11, 'City Branch', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553');

INSERT INTO field_officer
    (user_id, area_code, vehicle_no, status, created_at, updated_at)
VALUES
    (8, 'A001', 'WP AB-1234', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (9, 'A006', 'SP CD-5678', 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553');

INSERT INTO role
    (role_name)
VALUES
    ('SUPER_ADMIN'),
    ('VIEW_ADMIN'),
    ('CREATE_ADMIN'),
    ('DELETE_ADMIN'),
    ('UPDATE_ADMIN');

INSERT INTO permission
    (permission_name)
VALUES
    ('READ_CUSTOMER'),
    -- 1 
    ('CREATE_CUSTOMER'),
    -- 2
    ('UPDATE_CUSTOMER'),
    -- 3
    ('DELETE_CUSTOMER'),
    -- 4
    ('READ_MANAGER'),
    -- 5
    ('CREATE_MANAGER'),
    -- 6
    ('UPDATE_MANAGER'),
    -- 7
    ('DELETE_MANAGER'),
    -- 8
    ('READ_ADMIN'),
    -- 9
    ('CREATE_ADMIN'),
    -- 10 
    ('UPDATE_ADMIN'),
    -- 11
    ('DELETE_ADMIN'),
    -- 12 
    ('READ_FIELD_OFFICER'),
    -- 13
    ('CREATE_FIELD_OFFICER'),
    -- 14
    ('UPDATE_FIELD_OFFICER'),
    -- 15
    ('DELETE_FIELD_OFFICER'),
    -- 16
    ('READ_CASHIER'),
    -- 17
    ('CREATE_CASHIER'),
    -- 18
    ('UPDATE_CASHIER'),
    -- 19
    ('DELETE_CASHIER'),
    -- 20
    ('READ_ACTION_LOGS'),
    -- 21
    ('READ_COMPLAINTS'),
    -- 22
    ('MANAGE_COMPLAINTS'),
    -- 23
    ('READ_TARIFFS'),
    -- 24
    ('CREATE_TARIFFS'),
    -- 25
    ('UPDATE_TARIFFS'),
    -- 26
    ('DELETE_TARIFFS'),
    -- 27
    ('MANAGE_ADMIN_ROLES'),
    -- 28
    ('VIEW_PAYMENTS'),
    -- 29
    ('DELETE_PAYMENTS'),
    -- 30
    ('VIEW_BILLING'),
    -- 31
    ('DELETE_BILLING'),
    -- 32
    ('MANAGE_AREAS');
-- 33

INSERT INTO role_permission
    (role_id, permission_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7),
    (1, 8),
    (1, 9),
    (1, 10),
    (1, 11),
    (1, 12),
    (1, 13),
    (1, 14),
    (1, 15),
    (1, 16),
    (1, 17),
    (1, 18),
    (1, 19),
    (1, 20),
    (1, 21),
    (1, 22),
    (1, 23),
    (1, 24),
    (1, 25),
    (1, 26),
    (1, 27),
    (1, 28),
    (1, 29),
    (1, 30),
    (1, 31),
    (1, 32),
    (1, 33),
    (2, 1),
    (2, 5),
    (2, 9),
    (2, 13),
    (2, 17),
    (2, 21),
    (2, 22),
    (2, 23),
    (2, 24),
    (2, 29),
    (2, 31),
    (3, 1),
    (3, 2),
    (3, 5),
    (3, 6),
    (3, 9),
    (3, 10),
    (3, 13),
    (3, 14),
    (3, 17),
    (3, 18),
    (3, 21),
    (3, 22),
    (3, 23),
    (3, 24),
    (3, 25),
    (3, 29),
    (3, 31),
    (4, 1),
    (4, 4),
    (4, 5),
    (4, 8),
    (4, 9),
    (4, 12),
    (4, 13),
    (4, 16),
    (4, 17),
    (4, 20),
    (4, 21),
    (4, 22),
    (4, 23),
    (4, 24),
    (4, 27),
    (4, 29),
    (4, 30),
    (4, 31),
    (4, 32),
    (5, 1),
    (5, 3),
    (5, 5),
    (5, 7),
    (5, 9),
    (5, 11),
    (5, 13),
    (5, 15),
    (5, 17),
    (5, 19),
    (5, 21),
    (5, 22),
    (5, 23),
    (5, 24),
    (5, 26),
    (5, 29),
    (5, 31);

INSERT INTO admin
    (user_id, role_id, status, created_at, updated_at)
VALUES
    (1, 1, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (2, 2, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (3, 3, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (4, 4, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (5, 5, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553'),
    (18, 1, 'ACTIVE', '2025-12-10 12:48:37.553', '2025-12-10 12:48:37.553');

INSERT INTO admin_action_log
    (admin_id, entity_type, entity_id, action, time_stamp)
VALUES
    (1, 'CUSTOMER', '12', 'CREATE', '2025-12-10 12:48:37.553'),
    (5, 'MANAGER', '6', 'UPDATE', '2025-12-10 12:48:37.553');

INSERT INTO tariff
    (tariff_name, tariff_description, is_prorated, fixed_charge, tax_percentage, utility_type, status)
VALUES
    ('Domestic Plan A', 'Standard domestic electricity plan', 0, 150.00, 15.00, 'ELECTRICITY', 'ACTIVE'),
    ('Domestic Plan B - Prorated', 'Prorated billing electricity plan', 1, 200.00, 12.00, 'ELECTRICITY', 'ACTIVE');

INSERT INTO tariff_slab
    (tariff_id, slab_order, start_unit, end_unit, unit_rate)
VALUES
    (1, 1, 1, 60, 7.00),
    (1, 2, 61, 120, 12.00),
    (1, 3, 121, NULL, 20.00),
    (2, 1, 1, 50, 5.50),
    (2, 2, 51, 100, 9.50),
    (2, 3, 101, NULL, 18.00);

INSERT INTO utility_connection
    (customer_id, tariff_id, meter_serial_number, utility_type, install_date, status)
VALUES
    (12, 1, 'ELX-1001', 'ELECTRICITY', '2025-01-01', 'ACTIVE'),
    (13, 2, 'ELX-2001', 'ELECTRICITY', '2025-01-01', 'ACTIVE');


INSERT INTO meter_reading
    (field_officer_id, connection_id, reading_value)
VALUES
    (8, 1, 300);
INSERT INTO meter_reading
    (field_officer_id, connection_id, reading_value)
VALUES
    (8, 1, 360);
INSERT INTO meter_reading
    (field_officer_id, connection_id, reading_value)
VALUES
    (8, 1, 450);

INSERT INTO meter_reading
    (field_officer_id, connection_id, reading_value)
VALUES
    (9, 2, 500);
INSERT INTO meter_reading
    (field_officer_id, connection_id, reading_value)
VALUES
    (9, 2, 580);

SELECT *
FROM meter_reading;
SELECT *
FROM bill;

-- Cash payment
INSERT INTO payment
    (bill_id, cashier_id, payment_method, amount)
VALUES
    (1, 10, 'CASH', 200.00);
INSERT INTO cash
    (payment_id, amount_given, balance)
VALUES
    (SCOPE_IDENTITY(), 200.00, 0.00);

-- Card payment
INSERT INTO payment
    (bill_id, cashier_id, payment_method, amount)
VALUES
    (1, 11, 'CARD', 300.00);
INSERT INTO card
    (payment_id, platform_name, card_type, approval_code)
VALUES
    (SCOPE_IDENTITY(), 'VISA Gateway', 'DEBIT', 'APR12345');

-- Bank transfer payment
INSERT INTO payment
    (bill_id, cashier_id, payment_method, amount)
VALUES
    (1, 10, 'BANK TRANSFER', 155.50);
INSERT INTO bank_transfer
    (payment_id, bank_name, account_number, transaction_num)
VALUES
    (SCOPE_IDENTITY(), 'Commercial Bank', '1234567890', 'TXN99887');

-- Cash payment
INSERT INTO payment
    (bill_id, cashier_id, payment_method, amount)
VALUES
    (2, 11, 'CASH', 400.00);
INSERT INTO cash
    (payment_id, amount_given, balance)
VALUES
    (SCOPE_IDENTITY(), 500.00, 100.00);

SELECT
    p.payment_id,
    p.bill_id,
    p.cashier_id,
    p.payment_method,
    p.amount,
    p.payment_date,

    -- Cash details
    c.amount_given AS cash_amount_given,
    c.balance      AS cash_balance,

    -- Card details
    ca.platform_name AS card_platform,
    ca.card_type     AS card_type,
    ca.approval_code AS card_approval_code,

    -- Bank Transfer details
    bt.bank_name        AS bank_name,
    bt.account_number   AS bank_account_number,
    bt.transaction_num  AS bank_transaction_number

FROM payment p
    LEFT JOIN cash c ON p.payment_id = c.payment_id
    LEFT JOIN card ca ON p.payment_id = ca.payment_id
    LEFT JOIN bank_transfer bt ON p.payment_id = bt.payment_id
ORDER BY p.payment_id;