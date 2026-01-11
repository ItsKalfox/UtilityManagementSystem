-- 1st User Defined Function
CREATE FUNCTION fn_calculate_monthly_bill
(
    @connection_id INT,
    @consumption DECIMAL(10,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE 
        @tariff_id INT,
        @fixed_charge DECIMAL(10,2),
        @tax DECIMAL(5,2),
        @total DECIMAL(18,2);

    SELECT @tariff_id = tariff_id
    FROM utility_connection
    WHERE connection_id = @connection_id;

    SELECT 
        @fixed_charge = fixed_charge,
        @tax = tax_percentage
    FROM tariff
    WHERE tariff_id = @tariff_id;

    SET @total = (@consumption * 10) + @fixed_charge;
    SET @total = @total + (@total * @tax / 100);

    RETURN @total;
END;

-- 2nd User Defined Function
CREATE FUNCTION fn_calculate_late_fee
(
    @bill_id INT
)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE 
        @days_late INT,
        @late_fee DECIMAL(10,2) = 0;

    SELECT @days_late = DATEDIFF(DAY, period_end, GETDATE())
    FROM bill
    WHERE bill_id = @bill_id
      AND status <> 'FULLY PAID';

    IF @days_late > 0
        SET @late_fee = @days_late * 25;

    RETURN @late_fee;
END;