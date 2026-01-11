package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.TariffSlab;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TariffSlabRepository extends JpaRepository<TariffSlab, Integer> {
    List<TariffSlab> findByTariff_TariffIdOrderBySlabOrderAsc(Integer tariffId);
    void deleteByTariff_TariffId(Integer tariffId);
}