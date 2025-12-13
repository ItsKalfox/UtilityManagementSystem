package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.*;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.BusinessRepository;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import com.utilitymanagementsystem.spec.CustomerSpecification;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            BusinessRepository businessRepository
    ) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
    }

    /* =========================================================
       GET SINGLE CUSTOMER (POLYMORPHIC RESPONSE)
       ========================================================= */

    public CustomerDetailView getCustomerDetails(Integer customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = customer.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

        return switch (customer.getCustomerType()) {

            case "HOUSEHOLD" -> {
                Household h = customer.getHousehold();
                yield new HouseholdCustomerDetailDTO(
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
                        h.getHouseholdSize(),
                        phones
                );
            }

            case "BUSINESS" -> {
                Business b = customer.getBusiness();
                yield new BusinessCustomerDetailDTO(
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
                        b.getBusinessType(),
                        b.getBusinessRegiNum(),
                        b.getTaxId(),
                        phones
                );
            }

            case "GOVERNMENT ORGANIZATION" -> {
                GovernmentOrganization g = customer.getGovernmentOrganization();
                yield new GovernmentCustomerDetailDTO(
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
                        g.getGovernmentId(),
                        g.getDepartment(),
                        phones
                );
            }

            default -> throw new IllegalStateException("Unknown customer type");
        };
    }

    /* =========================================================
       UPDATE CUSTOMER (PATCH – PARTIAL UPDATE)
       ========================================================= */

    @Transactional
    public CustomerDetailView updateCustomer(Integer customerId, CustomerUpdateDTO dto) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = customer.getUser();
        String type = customer.getCustomerType();

        /* ---------- BASIC USER FIELDS ---------- */

        if (dto.fullName() != null) {
            user.setFullName(dto.fullName());
        }

        if (dto.email() != null) {
            if (userRepository.existsByEmailAndUserIdNot(dto.email(), user.getUserId())) {
                throw new ConflictException("Email already exists");
            }
            user.setEmail(dto.email());
        }

        if (dto.nic() != null) {
            if (userRepository.existsByNicAndUserIdNot(dto.nic(), user.getUserId())) {
                throw new ConflictException("NIC already exists");
            }
            user.setNic(dto.nic());
        }

        if (dto.status() != null) {
            user.setStatus(dto.status()); // DB CHECK constraint enforces validity
        }

        /* ---------- ADDRESS ---------- */

        if (dto.addressLine1() != null) customer.setAddressLine1(dto.addressLine1());
        if (dto.addressLine2() != null) customer.setAddressLine2(dto.addressLine2());
        if (dto.addressCity() != null) customer.setAddressCity(dto.addressCity());
        if (dto.addressPostalCode() != null) customer.setAddressPostalCode(dto.addressPostalCode());

        /* ---------- TYPE-SPECIFIC VALIDATION ---------- */

        boolean hasBusinessFields =
                dto.businessType() != null || dto.businessRegiNum() != null || dto.taxId() != null;

        boolean hasHouseholdFields =
                dto.householdSize() != null;

        boolean hasGovFields =
                dto.governmentId() != null || dto.department() != null;

        int typeCount =
                (hasBusinessFields ? 1 : 0) +
                        (hasHouseholdFields ? 1 : 0) +
                        (hasGovFields ? 1 : 0);

        if (typeCount > 1) {
            throw new IllegalArgumentException("Cannot update multiple customer types at once");
        }

        /* ---------- APPLY TYPE-SPECIFIC UPDATES ---------- */

        switch (type) {

            case "BUSINESS" -> {
                if (hasHouseholdFields || hasGovFields) {
                    throw new IllegalArgumentException("Invalid fields for BUSINESS customer");
                }

                Business business = customer.getBusiness();

                if (dto.businessRegiNum() != null &&
                        businessRepository.existsByBusinessRegiNumAndCustomerIdNot(
                                dto.businessRegiNum(), customerId)) {

                    throw new ConflictException("Business registration number already exists");
                }

                if (dto.businessType() != null) business.setBusinessType(dto.businessType());
                if (dto.businessRegiNum() != null) business.setBusinessRegiNum(dto.businessRegiNum());
                if (dto.taxId() != null) business.setTaxId(dto.taxId());
            }

            case "HOUSEHOLD" -> {
                if (hasBusinessFields || hasGovFields) {
                    throw new IllegalArgumentException("Invalid fields for HOUSEHOLD customer");
                }

                if (dto.householdSize() != null) {
                    customer.getHousehold().setHouseholdSize(dto.householdSize());
                }
            }

            case "GOVERNMENT ORGANIZATION" -> {
                if (hasBusinessFields || hasHouseholdFields) {
                    throw new IllegalArgumentException("Invalid fields for GOVERNMENT customer");
                }

                GovernmentOrganization gov = customer.getGovernmentOrganization();
                if (dto.governmentId() != null) gov.setGovernmentId(dto.governmentId());
                if (dto.department() != null) gov.setDepartment(dto.department());
            }

            default -> throw new IllegalStateException("Unknown customer type");
        }

        /* ---------- PHONE NUMBERS ---------- */

        if (dto.phoneNumbers() != null) {

            user.getPhoneNumbers().clear();

            for (PhoneNumberDTO p : dto.phoneNumbers()) {
                PhoneNumber phone = new PhoneNumber();
                phone.setUser(user);
                phone.setPhoneNumber(p.phoneNumber());
                phone.setNumberType(p.numberType()); // DB CHECK constraint validates
                user.getPhoneNumbers().add(phone);
            }
        }

        return getCustomerDetails(customerId);
    }

    /* =========================================================
       LIST CUSTOMERS (PAGINATION + SEARCH + FILTER + SORT)
       ========================================================= */

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
