package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.FieldOfficer;
import org.springframework.data.jpa.domain.Specification;

public class AdminSpecification {

    public static Specification<Admin> hasSearch(String search) {
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

    public static Specification<Admin> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Admin> hasRoleId(Integer roleId) {
        return (root, query, cb) -> {
            if (roleId == null) return null;
            return cb.equal(root.get("role").get("roleId"), roleId);
        };
    }
}

