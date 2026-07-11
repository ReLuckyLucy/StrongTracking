package com.strongtracking.repository;

import com.strongtracking.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    java.util.Optional<User> findByEmail(String email);
    java.util.Optional<User> findByUsername(String username);
    java.util.Optional<User> findById(UUID id);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countByCreatedAtAfter(@Param("since") Instant since);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY u.createdAt DESC")
    Page<User> findByUsernameContainingOrEmailContaining(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    long countByUsernameContainingOrEmailContaining(@Param("search") String search);

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
