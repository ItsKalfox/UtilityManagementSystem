package com.utilitymanagementsystem.controller;


import com.utilitymanagementsystem.dto.customer.ComplaintRequestDTO;

import com.utilitymanagementsystem.service.ComplaintService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping("/submit")
    public ResponseEntity<String> submitComplaint(
            @RequestBody ComplaintRequestDTO request) {

        complaintService.submitComplaint(request);
        return ResponseEntity.ok("Complaint submitted successfully");
    }
}
