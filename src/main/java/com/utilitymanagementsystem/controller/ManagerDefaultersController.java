package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.DefaulterRowView;
import com.utilitymanagementsystem.repository.ManagerBillingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
public class ManagerDefaultersController {

    private final ManagerBillingRepository managerBillingRepository;

    public ManagerDefaultersController(
            ManagerBillingRepository managerBillingRepository
    ) {
        this.managerBillingRepository = managerBillingRepository;
    }

    @GetMapping("/defaulters")
    public List<DefaulterRowView> getDefaulters() {
        return managerBillingRepository.findDefaulters();
    }
}
