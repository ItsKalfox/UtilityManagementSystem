package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.CustomerDetailDTO;
import com.utilitymanagementsystem.dto.CustomerListDTO;
import com.utilitymanagementsystem.dto.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.spec.CustomerSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
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
    public Page<CustomerListDTO> getCustomers(
            String search,
            String type,
            String status,
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Customer> spec =
                CustomerSpecification.hasSearch(search)
                        .and(CustomerSpecification.hasType(type))
                        .and(CustomerSpecification.hasStatus(status));

        Page<Customer> customers = customerRepository.findAll(spec, pageable);

        return customers.map(c ->
                new CustomerListDTO(
                        c.getUser().getUserId(),
                        c.getUser().getFullName(),
                        c.getUser().getNic(),
                        c.getCustomerType(),
                        c.getUser().getStatus()
                )
        );
    }
}
