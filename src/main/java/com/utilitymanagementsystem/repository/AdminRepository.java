package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.dto.admin.AdminListDTO;
import com.utilitymanagementsystem.dto.lists.AdminIdNameListDTO;
import com.utilitymanagementsystem.dto.lists.AreaListDTO;
import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.FieldOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer>, JpaSpecificationExecutor<Admin> {
    @Query("""
        SELECT new com.utilitymanagementsystem.dto.lists.AdminIdNameListDTO(
            a.user.userId,
            a.user.fullName
        )
        FROM Admin a
        ORDER BY a.user.userId
    """)
    List<AdminIdNameListDTO> findAllAdminIdAndNames();
    Optional<Admin> findByUser_UserId(Integer userId);
    boolean existsByUserId(Integer userId);

    long count();
    long countByStatus(String status);
}
