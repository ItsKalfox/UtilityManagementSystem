package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.model.Area;
import com.utilitymanagementsystem.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/areas") // Matches your fetch('/areas')
@CrossOrigin(origins = "*") // Allows your JS frontend to talk to this backend
public class AreaController {

    @Autowired
    private AreaRepository areaRepository;

    // 1. Save a new Area (For your saveNewArea JS function)
    @PostMapping
    public Area createArea(@RequestBody Area area) {
        return areaRepository.save(area);
    }

    // 2. Get all Areas (For your fetchAreas JS function)
    @GetMapping
    public List<?> getAllAreas() {
        return areaRepository.findAllAreas();
    }
}