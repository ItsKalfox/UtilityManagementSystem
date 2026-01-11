-- 1st Trigger
CREATE TRIGGER trg_after_meterreading_insert
ON meter_reading
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @reading_id INT,
        @connection_id INT,
        @reading_value DECIMAL(10,2);

    SELECT 
        @reading_id = reading_id,
        @connection_id = connection_id,
        @reading_value = reading_value
    FROM inserted;

    DECLARE 
        @prev_reading_value DECIMAL(10,2),
        @prev_period_end DATETIME;

    SELECT TOP 1 
        @prev_reading_value = reading_value,
        @prev_period_end = billing_period_end
    FROM meter_reading
    WHERE connection_id = @connection_id
      AND reading_id < @reading_id
    ORDER BY billing_period_end DESC;

    IF @prev_reading_value IS NULL
    BEGIN
        UPDATE meter_reading
        SET consumption = 0,
            billing_period_start = GETDATE(),
            billing_period_end = GETDATE()
        WHERE reading_id = @reading_id;

        RETURN;
    END;

    DECLARE 
        @consumption DECIMAL(10,2),
        @period_start DATETIME,
        @period_end DATETIME;

    SET @consumption = @reading_value - @prev_reading_value;
    SET @period_start = @prev_period_end;
    SET @period_end = GETDATE();

    UPDATE meter_reading
    SET consumption = @consumption,
        billing_period_start = @period_start,
        billing_period_end = @period_end
    WHERE reading_id = @reading_id;

    DECLARE
        @tariff_id INT,
        @is_prorated BIT,
        @fixed_charge DECIMAL(10,2),
        @tax DECIMAL(5,2);

    SELECT @tariff_id = tariff_id
    FROM utility_connection
    WHERE connection_id = @connection_id;

    SELECT 
        @is_prorated = is_prorated,
        @fixed_charge = fixed_charge,
        @tax = tax_percentage
    FROM tariff
    WHERE tariff_id = @tariff_id;

    DECLARE @billing_days INT;

    SET @billing_days =
        CASE 
            WHEN @is_prorated = 1 THEN DATEDIFF(DAY, @period_start, @period_end)
            ELSE 30
        END;

    DECLARE 
        @remaining_units DECIMAL(10,2),
        @slab_start INT,
        @slab_end INT,
        @unit_rate DECIMAL(10,2),
        @slab_total DECIMAL(18,2);

    SET @remaining_units = @consumption;
    SET @slab_total = 0;

    DECLARE slab_cursor CURSOR FOR
        SELECT start_unit, end_unit, unit_rate
        FROM tariff_slab
        WHERE tariff_id = @tariff_id
        ORDER BY slab_order ASC;

    OPEN slab_cursor;
    FETCH NEXT FROM slab_cursor INTO @slab_start, @slab_end, @unit_rate;

    WHILE @@FETCH_STATUS = 0 AND @remaining_units > 0
    BEGIN
        DECLARE @slab_units INT;

        IF @slab_end IS NULL
            SET @slab_units = @remaining_units;
        ELSE
            SET @slab_units = 
                CASE 
                    WHEN @remaining_units > (@slab_end - @slab_start + 1)
                        THEN (@slab_end - @slab_start + 1)
                    ELSE @remaining_units
                END;

        SET @slab_total += @slab_units * @unit_rate;
        SET @remaining_units -= @slab_units;

        FETCH NEXT FROM slab_cursor INTO @slab_start, @slab_end, @unit_rate;
    END

    CLOSE slab_cursor;
    DEALLOCATE slab_cursor;

    DECLARE @final_fixed_charge DECIMAL(18,2);

    SET @final_fixed_charge =
        CASE 
            WHEN @is_prorated = 1 THEN (@fixed_charge / 30.0) * @billing_days
            ELSE @fixed_charge
        END;

    DECLARE @total_bill DECIMAL(18,2);

    SET @total_bill = @slab_total + @final_fixed_charge;
    SET @total_bill = @total_bill + (@total_bill * @tax / 100.0);

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
        @period_start,
        @period_end,
        @total_bill,
        @total_bill,
        'PENDING'
    );

END;

-- 2nd Trigger
CREATE TRIGGER trg_after_payment
ON payment
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE b
    SET b.outstanding_amount = b.outstanding_amount - i.amount
    FROM bill b
    INNER JOIN inserted i ON b.bill_id = i.bill_id;

    UPDATE b
    SET b.status =
        CASE 
            WHEN b.outstanding_amount <= 0 THEN 'FULLY PAID'
            ELSE 'PARTIALLY PAID'
        END
    FROM bill b
    INNER JOIN inserted i ON b.bill_id = i.bill_id;
END;