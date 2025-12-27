package com.utilitymanagementsystem.dto.stats;

public record AdminDashboardStatDTO(
    Integer totalCustomers,
    Integer activeCustomers,
    Integer totalAdmins,
    Integer activeAdmins,
    Integer totalManagers,
    Integer activeManagers,
    Integer totalCashiers,
    Integer activeCashiers,
    Integer totalFieldOfficers,
    Integer activeFieldOfficers,
    Integer totalWaterConn,
    Integer activeWaterConn,
    Integer totalElectricityConn,
    Integer activeElectricityConn,
    Integer totalGasConn,
    Integer activeGasConn,
    Integer totalOpenCom,
    Integer totalInProgressCom,
    Integer totalResolvedCom,
    Integer urgentCom
) { }
