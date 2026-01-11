package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.customer.ComplaintRequestDTO;

import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private FieldOfficerRepository fieldOfficerRepository;

    public void submitComplaint(ComplaintRequestDTO dto) {

        Complaint complaint = new Complaint();

        // 1️⃣ Customer (from frontend)
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        complaint.setCustomer(customer);

        // 2️⃣ Assign ANY existing admin (temporary logic)
        Admin admin = adminRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No admin found"));
        complaint.setAdmin(admin);

        // 3️⃣ Assign ANY existing field officer
        FieldOfficer officer = fieldOfficerRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No field officer found"));
        complaint.setFieldOfficer(officer);

        // 4️⃣ Complaint details
        complaint.setComplaintType(dto.getComplaintType());
        complaint.setDescription(dto.getDescription());
        complaint.setStatus("OPEN");
        complaint.setSubmittedDate(Instant.now());

        // 5️⃣ Save using leader’s repository
        complaintRepository.save(complaint);
    }
}
