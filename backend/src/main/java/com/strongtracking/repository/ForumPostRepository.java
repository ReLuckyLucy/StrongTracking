package com.strongtracking.repository;

import com.strongtracking.model.ForumPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {

    @Query("SELECT p FROM ForumPost p LEFT JOIN FETCH p.user WHERE p.id = :id")
    Optional<ForumPost> findByIdWithUser(@Param("id") UUID id);

    @Query("SELECT p FROM ForumPost p LEFT JOIN FETCH p.user ORDER BY p.createdAt DESC")
    List<ForumPost> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(p) FROM ForumPost p")
    long countPosts();

    @Query("SELECT p FROM ForumPost p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<ForumPost> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
