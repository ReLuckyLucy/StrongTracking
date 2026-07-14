package com.strongtracking.repository;

import com.strongtracking.model.ForumComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {

    @Query("SELECT c FROM ForumComment c LEFT JOIN FETCH c.user WHERE c.post.id = :postId ORDER BY c.createdAt ASC")
    List<ForumComment> findByPostIdWithUser(@Param("postId") UUID postId);
}
