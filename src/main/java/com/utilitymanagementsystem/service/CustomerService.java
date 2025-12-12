package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.CustomerDetailDTO;
import com.utilitymanagementsystem.dto.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerDetailDTO getCustomerDetails(Integer customerId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = customer.getUser();

        List<PhoneNumberDTO> phoneNumberDTOs = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(
                        p.getPhoneNumber(),
                        p.getNumberType()
                ))
                .toList();

        return new CustomerDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                user.getStatus(),
                customer.getCustomerType(),
                customer.getAddressLine1(),
                customer.getAddressLine2(),
                customer.getAddressCity(),
                customer.getAddressPostalCode(),
                phoneNumberDTOs
        );
    }
}
