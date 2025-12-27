package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.customer.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.EmailSendException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.security.PasswordGenerator;
import com.utilitymanagementsystem.spec.CustomerSpecification;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final HouseholdRepository householdRepository;
    private final GovernmentOrganizationRepository governmentRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final EmailService emailService;

    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            BusinessRepository businessRepository,
            HouseholdRepository householdRepository,
            GovernmentOrganizationRepository governmentRepository,
            AreaRepository areaRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            EmailService emailService
    ) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.householdRepository = householdRepository;
        this.governmentRepository = governmentRepository;
        this.areaRepository = areaRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
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
                        c.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public CustomerNICCheckDTO checkCustomer(@PathVariable String nic) {
        User user = userRepository.findByNic(nic).orElse(null);
        if (user == null) {
            return new CustomerNICCheckDTO(false, false, null);
        }
        boolean hasCustomerProfile = customerRepository.existsByUserId(user.getUserId());
        if (hasCustomerProfile) {
            return new CustomerNICCheckDTO(true, true, null);
        }
        return new CustomerNICCheckDTO(true, false, user.getUserId());
    }

    @Transactional(readOnly = true)
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
                        customer.getStatus(),
                        customer.getCreatedAt(),
                        customer.getUpdatedAt(),
                        customer.getAreaCode().getAreaCode(),
                        customer.getAddressLine1(),
                        customer.getAddressLine2(),
                        customer.getAddressCity(),
                        customer.getAddressPostalCode(),
                        customer.getCustomerType(),
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
                        customer.getStatus(),
                        customer.getCreatedAt(),
                        customer.getUpdatedAt(),
                        customer.getAreaCode().getAreaCode(),
                        customer.getAddressLine1(),
                        customer.getAddressLine2(),
                        customer.getAddressCity(),
                        customer.getAddressPostalCode(),
                        customer.getCustomerType(),
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
                        customer.getStatus(),
                        customer.getCreatedAt(),
                        customer.getUpdatedAt(),
                        customer.getAreaCode().getAreaCode(),
                        customer.getAddressLine1(),
                        customer.getAddressLine2(),
                        customer.getAddressCity(),
                        customer.getAddressPostalCode(),
                        customer.getCustomerType(),
                        g.getGovernmentId(),
                        g.getDepartment(),
                        phones
                );
            }

            default -> throw new IllegalStateException("Unknown customer type");
        };
    }

    @Transactional
    public CustomerDetailView updateCustomer(Integer customerId, CustomerUpdateDTO dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = customer.getUser();
        String type = customer.getCustomerType();

        if (dto.fullName() != null) {
            if (dto.fullName().isBlank()) {
                throw new IllegalArgumentException("fullName field cannot be blank");
            }
            user.setFullName(dto.fullName());
        }

        if (dto.email() != null) {
            if (dto.email().isBlank()) {
                throw new IllegalArgumentException("email field cannot be blank");
            }

            if (!dto.email().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                throw new IllegalArgumentException("Invalid email format");
            }

            if (userRepository.existsByEmailAndUserIdNot(dto.email(), user.getUserId())) {
                throw new ConflictException("Email already exists");
            }
            user.setEmail(dto.email());
        }

        if (dto.nic() != null) {
            if (dto.nic().isBlank()) {
                throw new IllegalArgumentException("nic field cannot be blank");
            }

            if (!dto.nic().matches("\\d{9}[VvXx]|\\d{12}")) {
                throw new IllegalArgumentException("Invalid NIC format");
            }

            if (userRepository.existsByNicAndUserIdNot(dto.nic(), user.getUserId())) {
                throw new ConflictException("NIC already exists");
            }
            user.setNic(dto.nic());
        }

        if (dto.areaCode() != null) {
            if (dto.areaCode().isBlank()) {
                throw new IllegalArgumentException("areaCode field cannot be blank");
            }

            Area area = areaRepository.findById(dto.areaCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

            customer.setAreaCode(area);
        }

        if (dto.addressLine1() != null) {
            if (dto.addressLine1().isBlank()) {
                throw new IllegalArgumentException("addressLine1 field cannot be blank");
            }

            customer.setAddressLine1(dto.addressLine1());
        }

        if (dto.addressLine2() != null) {
            if (dto.addressLine2().isBlank()) {
                throw new IllegalArgumentException("addressLine2 field cannot be blank");
            }

            customer.setAddressLine2(dto.addressLine2());
        }

        if (dto.addressCity() != null) {
            if (dto.addressCity().isBlank()) {
                throw new IllegalArgumentException("addressCity field cannot be blank");
            }

            customer.setAddressCity(dto.addressCity());
        }

        if (dto.addressPostalCode() != null) {
            if (dto.addressPostalCode().isBlank()) {
                throw new IllegalArgumentException("addressPostalCode field cannot be blank");
            }

            customer.setAddressPostalCode(dto.addressPostalCode());
        }

        boolean hasBusinessFields = dto.businessType() != null || dto.businessRegiNum() != null || dto.taxId() != null;
        boolean hasHouseholdFields = dto.householdSize() != null;
        boolean hasGovFields = dto.governmentId() != null || dto.department() != null;

        int typeCount = (hasBusinessFields ? 1 : 0) +
                        (hasHouseholdFields ? 1 : 0) +
                        (hasGovFields ? 1 : 0);

        if (typeCount > 1) {
            throw new IllegalArgumentException("Cannot update multiple customer types at once");
        }

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

        if (dto.phoneNumbers() != null) {
            if (dto.phoneNumbers().isEmpty()) {
                throw new IllegalArgumentException("phoneNumbers list cannot be empty");
            }

            user.getPhoneNumbers().clear();

            for (PhoneNumberDTO p : dto.phoneNumbers()) {
                if (p.phoneNumber() == null || p.phoneNumber().isBlank()) {
                    throw new IllegalArgumentException("phoneNumber field cannot be blank");
                }

                if (!p.phoneNumber().matches("^\\+[1-9]\\d{7,14}$")) {
                    throw new IllegalArgumentException("Phone number must be in E.164 format");
                }

                if (p.numberType() == null) {
                    throw new IllegalArgumentException("numberType field cannot be null");
                }

                if (!p.numberType().equals("MOBILE") && !p.numberType().equals("HOME") && !p.numberType().equals("WORK")) {
                    throw new IllegalArgumentException("numberType is invalid");
                }

                PhoneNumber phone = new PhoneNumber();
                phone.setUser(user);
                phone.setPhoneNumber(p.phoneNumber());
                phone.setNumberType(p.numberType());
                user.getPhoneNumbers().add(phone);
            }
        }

        adminActionLogService.logAction(
                "CUSTOMER",
                customerId.toString(),
                "UPDATE"
        );

        return getCustomerDetails(customerId);
    }

    @Transactional
    public CustomerDetailView createCustomer(CustomerCreateDTO dto) {
        User user = userRepository.findById(dto.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (customerRepository.findByUser_UserId(dto.customerId()).isPresent()) {
            throw new ConflictException("Customer already exists");
        }

        if (dto.areaCode() == null || dto.areaCode().isBlank()) {
            throw new IllegalArgumentException("Invalid area field");
        }

        Area area = areaRepository.findById(dto.areaCode())
                .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

        boolean hasBusinessFields = dto.businessType() != null || dto.businessRegiNum() != null || dto.taxId() != null;
        boolean hasHouseholdFields = dto.householdSize() != null;
        boolean hasGovFields = dto.governmentId() != null || dto.department() != null;

        int typeCount = (hasBusinessFields ? 1 : 0) +
                        (hasHouseholdFields ? 1 : 0) +
                        (hasGovFields ? 1 : 0);

        if (typeCount > 1) {
            throw new IllegalArgumentException("Malformed fields");
        }

        switch (dto.customerType()) {
            case "HOUSEHOLD" -> {
                if (dto.householdSize() == null || dto.householdSize() <= 0 || dto.addressCity().isBlank()) {
                    throw new IllegalArgumentException("Invalid householdSize field");
                }
            }

            case "BUSINESS" -> {
                if (dto.businessType() == null || dto.businessType().isBlank()) {
                    throw new IllegalArgumentException("Invalid businessType field");
                }

                if (dto.businessRegiNum() == null ||  dto.businessRegiNum().isBlank()) {
                    throw new IllegalArgumentException("Invalid businessRegiNum field");
                }

                if (businessRepository.existsByBusinessRegiNum(dto.businessRegiNum())) {
                    throw new ConflictException("Business registration number already exists");
                }

                if (dto.taxId() == null || dto.taxId().isBlank()) {
                    throw new IllegalArgumentException("Invalid taxId field");
                }
            }

            case "GOVERNMENT ORGANIZATION" -> {
                if (dto.governmentId() == null || dto.governmentId().isBlank()) {
                    throw new IllegalArgumentException("Invalid governmentId field");
                }

                if (dto.department() == null || dto.department().isBlank()) {
                    throw new IllegalArgumentException("Invalid department field");
                }
            }

            default -> throw new IllegalArgumentException("Unknown customer type");
        }

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerType(dto.customerType());
        customer.setAreaCode(area);
        customer.setAddressLine1(dto.addressLine1());
        customer.setAddressLine2(dto.addressLine2());
        customer.setAddressCity(dto.addressCity());
        customer.setAddressPostalCode(dto.addressPostalCode());
        customer.setPasswordHash("password");
        customer.setStatus("INACTIVE");

        customerRepository.save(customer);

        switch (dto.customerType()) {
            case "HOUSEHOLD" -> {

                Household h = new Household();
                h.setCustomer(customer);
                h.setHouseholdSize(dto.householdSize());

                householdRepository.save(h);
                customer.setHousehold(h);
            }

            case "BUSINESS" -> {

                Business b = new Business();
                b.setCustomer(customer);
                b.setBusinessType(dto.businessType());
                b.setBusinessRegiNum(dto.businessRegiNum());
                b.setTaxId(dto.taxId());

                businessRepository.save(b);
                customer.setBusiness(b);
            }

            case "GOVERNMENT ORGANIZATION" -> {

                GovernmentOrganization g = new GovernmentOrganization();
                g.setCustomer(customer);
                g.setGovernmentId(dto.governmentId());
                g.setDepartment(dto.department());

                governmentRepository.save(g);
                customer.setGovernmentOrganization(g);
            }

            default -> throw new IllegalArgumentException("Unknown customer type");
        }

        adminActionLogService.logAction(
                "CUSTOMER",
                dto.customerId().toString(),
                "CREATE"
        );

        return getCustomerDetails(dto.customerId());
    }

    @Transactional
    public CustomerDetailView createFullCustomer(CustomerCreateFullDTO dto) {
        if (!dto.email().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Email already exists");
        }

        if (!dto.nic().matches("\\d{9}[VvXx]|\\d{12}")) {
            throw new IllegalArgumentException("Invalid NIC format");
        }

        if (userRepository.existsByNic(dto.nic())) {
            throw new ConflictException("NIC already exists");
        }

        Area area = areaRepository.findById(dto.areaCode())
                .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

        boolean hasBusinessFields = dto.businessType() != null || dto.businessRegiNum() != null || dto.taxId() != null;
        boolean hasHouseholdFields = dto.householdSize() != null;
        boolean hasGovFields = dto.governmentId() != null || dto.department() != null;

        int typeCount = (hasBusinessFields ? 1 : 0) +
                        (hasHouseholdFields ? 1 : 0) +
                        (hasGovFields ? 1 : 0);

        if (typeCount > 1) {
            throw new IllegalArgumentException("Malformed fields");
        }

        switch (dto.customerType()) {
            case "HOUSEHOLD" -> {
                if (dto.householdSize() == null || dto.householdSize() <= 0 || dto.addressCity().isBlank()) {
                    throw new IllegalArgumentException("Invalid householdSize field");
                }
            }

            case "BUSINESS" -> {
                if (dto.businessType() == null || dto.businessType().isBlank()) {
                    throw new IllegalArgumentException("Invalid businessType field");
                }

                if (dto.businessRegiNum() == null ||  dto.businessRegiNum().isBlank()) {
                    throw new IllegalArgumentException("Invalid businessRegiNum field");
                }

                if (businessRepository.existsByBusinessRegiNum(dto.businessRegiNum())) {
                    throw new ConflictException("Business registration number already exists");
                }

                if (dto.taxId() == null || dto.taxId().isBlank()) {
                    throw new IllegalArgumentException("Invalid taxId field");
                }
            }

            case "GOVERNMENT ORGANIZATION" -> {
                if (dto.governmentId() == null || dto.governmentId().isBlank()) {
                    throw new IllegalArgumentException("Invalid governmentId field");
                }

                if (dto.department() == null || dto.department().isBlank()) {
                    throw new IllegalArgumentException("Invalid department field");
                }
            }

            default -> throw new IllegalArgumentException("Unknown customer type");
        }

        User user = new User();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setNic(dto.nic());

        userRepository.save(user);

        for (PhoneNumberDTO p : dto.phoneNumbers()) {
            if (p.phoneNumber() == null || p.phoneNumber().isBlank()) {
                throw new IllegalArgumentException("phoneNumber cannot be blank");
            }

            if (!p.phoneNumber().matches("^\\+[1-9]\\d{7,14}$")) {
                throw new IllegalArgumentException("Phone number must be in E.164 format");
            }

            if (p.numberType() == null) {
                throw new IllegalArgumentException("numberType field cannot be null");
            }

            if (!p.numberType().equals("MOBILE") && !p.numberType().equals("HOME") && !p.numberType().equals("WORK")) {
                throw new IllegalArgumentException("numberType is invalid");
            }

            PhoneNumber phone = new PhoneNumber();
            phone.setUser(user);
            phone.setPhoneNumber(p.phoneNumber());
            phone.setNumberType(p.numberType());

            user.getPhoneNumbers().add(phone);
        }

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setAreaCode(area);
        customer.setCustomerType(dto.customerType());
        customer.setAddressLine1(dto.addressLine1());
        customer.setAddressLine2(dto.addressLine2());
        customer.setAddressCity(dto.addressCity());
        customer.setAddressPostalCode(dto.addressPostalCode());
        customer.setPasswordHash("password");
        customer.setStatus("INACTIVE");

        customerRepository.save(customer);

        switch (dto.customerType()) {
            case "HOUSEHOLD" -> {

                Household h = new Household();
                h.setCustomer(customer);
                h.setHouseholdSize(dto.householdSize());

                householdRepository.save(h);
                customer.setHousehold(h);
            }

            case "BUSINESS" -> {

                Business b = new Business();
                b.setCustomer(customer);
                b.setBusinessType(dto.businessType());
                b.setBusinessRegiNum(dto.businessRegiNum());
                b.setTaxId(dto.taxId());

                businessRepository.save(b);
                customer.setBusiness(b);
            }

            case "GOVERNMENT ORGANIZATION" -> {

                GovernmentOrganization g = new GovernmentOrganization();
                g.setCustomer(customer);
                g.setGovernmentId(dto.governmentId());
                g.setDepartment(dto.department());

                governmentRepository.save(g);
                customer.setGovernmentOrganization(g);
            }

            default -> throw new IllegalArgumentException("Unknown customer type");
        }

        adminActionLogService.logAction(
                "CUSTOMER",
                user.getUserId().toString(),
                "CREATE"
        );

        return getCustomerDetails(user.getUserId());
    }

    @Transactional
    public void deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        adminActionLogService.logAction(
                "CUSTOMER",
                customerId.toString(),
                "DELETE"
        );

        customerRepository.delete(customer);
    }

    @Transactional
    public void resetCustomerPassword(Integer userId) {

        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawPassword = PasswordGenerator.generate(14);
        String hashedPassword = passwordEncoder.encode(rawPassword);

        customer.setPasswordHash(hashedPassword);
        customerRepository.save(customer);

        User user = customer.getUser();

        try {
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getFullName(),
                    rawPassword
            );
        } catch (Exception e) {
            throw new EmailSendException("Failed to send password reset email");
        }

        adminActionLogService.logAction(
                "CUSTOMER",
                user.getUserId().toString(),
                "Customer Password Reset"
        );
    }

    @Transactional
    public void activateCustomer(Integer userId) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Customer is already Active");
        }

        customer.setStatus("ACTIVE");
        customerRepository.save(customer);

        adminActionLogService.logAction(
                "CUSTOMER",
                customer.getUserId().toString(),
                "Customer Account activated"
        );
    }

    @Transactional
    public void deactivateCustomer(Integer userId) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.getStatus().equals("INACTIVE")) {
            throw new RuntimeException("Customer is already Inactive");
        }

        customer.setStatus("INACTIVE");
        customerRepository.save(customer);

        adminActionLogService.logAction(
                "CUSTOMER",
                customer.getUserId().toString(),
                "Customer Account deactivated"
        );
    }
}