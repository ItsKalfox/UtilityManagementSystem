package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.domain.Specification;

public class ManagerSpecification {

    public static Specification<Manager> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            String like = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("user").get("fullName")), like),
                    cb.like(cb.lower(root.get("user").get("email")), like),
                    cb.like(cb.lower(root.get("user").get("nic")), like),
                    cb.like(cb.lower(root.get("department")), like),
                    cb.like(
                            cb.lower(root.get("user").get("userId").as(String.class)),
                            like
                    )
            );
        };
    }

    public static Specification<Manager> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), status);
        };
    }
}

