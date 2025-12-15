package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.*;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            String like = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("nic")), like),
                    cb.like(
                            cb.lower(root.get("userId").as(String.class)),
                            like
                    )
            );
        };
    }

    public static Specification<User> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<User> hasProfile(String profile) {
        return (root, query, cb) -> {
            if (profile == null || profile.isBlank()) return null;

            switch (profile.toUpperCase()) {

                case "CUSTOMER" -> {
                    var sub = query.subquery(Integer.class);
                    var customer = sub.from(Customer.class);
                    sub.select(cb.literal(1))
                            .where(cb.equal(customer.get("user"), root));
                    return cb.exists(sub);
                }

                case "ADMIN" -> {
                    var sub = query.subquery(Integer.class);
                    var admin = sub.from(Admin.class);
                    sub.select(cb.literal(1))
                            .where(cb.equal(admin.get("user"), root));
                    return cb.exists(sub);
                }

                case "MANAGER" -> {
                    var sub = query.subquery(Integer.class);
                    var manager = sub.from(Manager.class);
                    sub.select(cb.literal(1))
                            .where(cb.equal(manager.get("user"), root));
                    return cb.exists(sub);
                }

                case "FIELD_OFFICER" -> {
                    var sub = query.subquery(Integer.class);
                    var officer = sub.from(FieldOfficer.class);
                    sub.select(cb.literal(1))
                            .where(cb.equal(officer.get("user"), root));
                    return cb.exists(sub);
                }

                case "CASHIER" -> {
                    var sub = query.subquery(Integer.class);
                    var cashier = sub.from(Cashier.class);
                    sub.select(cb.literal(1))
                            .where(cb.equal(cashier.get("user"), root));
                    return cb.exists(sub);
                }

                default -> throw new IllegalArgumentException("Unknown profile type");
            }
        };
    }

}

