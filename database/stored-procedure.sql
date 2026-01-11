-- 1st Stored Procedure
CREATE PROCEDURE sp_generate_bill_for_customer
(
    @connection_id INT,
    @consumption DECIMAL(10,2)
)
AS
BEGIN
    DECLARE @total DECIMAL(18,2);

    SET @total = dbo.fn_calculate_monthly_bill(@connection_id, @consumption);

    INSERT INTO bill (
        connection_id,
        period_start,
        period_end,
        total_bill_amount,
        outstanding_amount,
        status
    )
    VALUES (
        @connection_id,
        DATEADD(MONTH, -1, GETDATE()),
        GETDATE(),
        @total,
        @total,
        'PENDING'
    );
END;

-- 2st Stored Procedure
CREATE PROCEDURE sp_list_defaulters
AS
BEGIN
    SELECT 
        u.full_name,
        u.email,
        b.bill_id,
        b.outstanding_amount,
        b.period_end
    FROM bill b
    JOIN utility_connection uc ON b.connection_id = uc.connection_id
    JOIN customer c ON uc.customer_id = c.user_id
    JOIN users u ON c.user_id = u.user_id
    WHERE b.status <> 'FULLY PAID'
      AND DATEDIFF(DAY, b.period_end, GETDATE()) > 30;
END;