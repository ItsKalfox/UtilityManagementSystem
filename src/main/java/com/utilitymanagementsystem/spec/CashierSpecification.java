package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.domain.Specification;

public class CashierSpecification {

    public static Specification<Cashier> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            String like = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("user").get("fullName")), like),
                    cb.like(cb.lower(root.get("user").get("email")), like),
                    cb.like(cb.lower(root.get("user").get("nic")), like),
                    cb.like(cb.lower(root.get("branchName")), like),
                    cb.like(
                            cb.lower(root.get("user").get("userId").as(String.class)),
                            like
                    )
            );
        };
    }

    public static Specification<Cashier> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("user").get("status"), status);
        };
    }
}

