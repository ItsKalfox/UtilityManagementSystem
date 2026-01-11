package com.utilitymanagementsystem.dto.manager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class UtilityIncomeReportDTO {
    public String utilityType;
    public LocalDate from;
    public LocalDate to;

    public BigDecimal totalIncome;

    public List<UtilityIncomeRowDTO> rows = new ArrayList<>();
}