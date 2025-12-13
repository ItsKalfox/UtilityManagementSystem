package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.Customer;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    public static Specification<Customer> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            String like = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("user").get("fullName")), like),
                    cb.like(cb.lower(root.get("user").get("email")), like),
                    cb.like(cb.lower(root.get("user").get("nic")), like),
                    cb.like(
                            cb.lower(root.get("user").get("userId").as(String.class)),
                            like
                    )
            );
        };
    }

    public static Specification<Customer> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("user").get("status"), status);
        };
    }

    public static Specification<Customer> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.isBlank()) return null;
            return cb.equal(root.get("customerType"), type);
        };
    }
}

