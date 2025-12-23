package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.area.AreaListDTO;
import com.utilitymanagementsystem.repository.AreaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    public List<AreaListDTO> getAllAreas() {
        return areaRepository.findAllAreas();
    }
}