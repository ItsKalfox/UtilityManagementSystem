package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    long countByStatus(String status);
    @Query(
                value = """
        SELECT COUNT(*)
        FROM complaint
        WHERE status IN ('OPEN', 'IN PROGRESS')
          AND submitted_date < DATEADD(DAY, -7, GETDATE())
      """,
            nativeQuery = true
    )
    long countUrgentComplaints();
}