package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Manager;
import com.utilitymanagementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(Integer userId);

    boolean existsByEmailAndUserIdNot(String email, Integer userId);

    boolean existsByNicAndUserIdNot(String nic, Integer userId);
    boolean existsByEmail(String email);
    boolean existsByNic(String nic);

}