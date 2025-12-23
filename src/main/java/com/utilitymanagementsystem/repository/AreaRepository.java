package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.dto.area.AreaListDTO;
import com.utilitymanagementsystem.model.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AreaRepository extends JpaRepository<Area, String> {
    @Query("""
        SELECT new com.utilitymanagementsystem.dto.area.AreaListDTO(
            a.areaCode,
            a.areaName
        )
        FROM Area a
        ORDER BY a.areaName
    """)
    List<AreaListDTO> findAllAreas();
}