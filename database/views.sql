-- 1st View
CREATE VIEW vw_unpaid_bills
AS
SELECT 
    b.bill_id,
    c.user_id AS customer_id,
    u.full_name,
    b.total_bill_amount,
    b.outstanding_amount,
    b.status
FROM bill b
JOIN utility_connection uc ON b.connection_id = uc.connection_id
JOIN customer c ON uc.customer_id = c.user_id
JOIN users u ON c.user_id = u.user_id
WHERE b.status <> 'FULLY PAID';


-- 2nd View
CREATE VIEW vw_monthly_revenue
AS
SELECT 
    YEAR(payment_date) AS year,
    MONTH(payment_date) AS month,
    SUM(amount) AS total_revenue
FROM payment
GROUP BY YEAR(payment_date), MONTH(payment_date);