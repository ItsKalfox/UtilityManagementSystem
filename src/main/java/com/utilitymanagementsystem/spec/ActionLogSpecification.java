package com.utilitymanagementsystem.spec;

import com.utilitymanagementsystem.model.*;
import jakarta.persistence.criteria.Path;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class ActionLogSpecification {

    public static Specification<AdminActionLog> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;

            String like = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("entityId")), like),
                    cb.like(root.get("logId").as(String.class), like),
                    cb.like(root.get("admin").get("user").get("userId").as(String.class), like)
            );
        };
    }

    public static Specification<AdminActionLog> hasEntity(String entity) {
        return (root, query, cb) -> {
            if (entity == null || entity.isBlank()) return null;
            return cb.equal(root.get("entityType"), entity);
        };
    }

    public static Specification<AdminActionLog> hasAction(String action) {
        return (root, query, cb) -> {
            if (action == null || action.isBlank()) return null;
            return cb.equal(root.get("action"), action);
        };
    }

    public static Specification<AdminActionLog> hasAdminId(Integer adminId) {
        return (root, query, cb) -> {
            if (adminId == null) return null;
            return cb.equal(root.get("admin").get("user").get("userId"), adminId);
        };
    }

    public static Specification<AdminActionLog> hasDateRange(
            LocalDateTime from,
            LocalDateTime to
    ) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;

            Path<Instant> ts = root.get("timeStamp");

            if (from != null && to != null) {
                return cb.between(
                        ts,
                        from.atZone(ZoneId.systemDefault()).toInstant(),
                        to.atZone(ZoneId.systemDefault()).toInstant()
                );
            }

            if (from != null) {
                return cb.greaterThanOrEqualTo(
                        ts,
                        from.atZone(ZoneId.systemDefault()).toInstant()
                );
            }

            return cb.lessThan(
                    ts,
                    to.atZone(ZoneId.systemDefault()).toInstant()
            );
        };
    }
}

