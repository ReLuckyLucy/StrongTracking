package com.strongtracking.repository;

import com.strongtracking.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    @Query("SELECT e FROM Exercise e WHERE e.user IS NULL AND e.name = :name")
    Optional<Exercise> findPresetByName(@Param("name") String name);

    @Query("SELECT e FROM Exercise e WHERE e.user IS NULL OR e.user.id = :userId ORDER BY CASE WHEN e.user IS NULL THEN 0 ELSE 1 END, e.name ASC")
    List<Exercise> findAllAccessible(@Param("userId") UUID userId);

    @Query("SELECT COUNT(e) FROM Exercise e WHERE e.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);
}
