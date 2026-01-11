package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.model.Area;
import com.utilitymanagementsystem.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/areas")
@CrossOrigin(origins = "*")
public class AreaController {
    @Autowired
    private AreaRepository areaRepository;

    @PostMapping
    public Area createArea(@RequestBody Area area) {
        return areaRepository.save(area);
    }

    @GetMapping
    public List<?> getAllAreas() {
        return areaRepository.findAllAreas();
    }
}