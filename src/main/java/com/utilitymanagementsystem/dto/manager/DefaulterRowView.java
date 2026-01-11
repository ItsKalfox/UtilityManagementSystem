package com.utilitymanagementsystem.dto.manager;

import java.math.BigDecimal;

public interface DefaulterRowView {
    Integer getCustomerId();
    String getFullName();
    String getAreaCode();
    String getAreaName();
    BigDecimal getTotalOutstanding();
}