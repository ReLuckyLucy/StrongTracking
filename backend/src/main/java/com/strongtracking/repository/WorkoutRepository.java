package com.strongtracking.repository;

import com.strongtracking.model.Workout;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

    @Query("SELECT w FROM Workout w LEFT JOIN FETCH w.sets s LEFT JOIN FETCH s.exercise WHERE w.id = :id AND w.user.id = :userId")
    Optional<Workout> findByIdWithSets(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT w FROM Workout w WHERE w.user.id = :userId AND (:dateFrom IS NULL OR w.date >= :dateFrom) AND (:dateTo IS NULL OR w.date <= :dateTo) ORDER BY w.date DESC, w.createdAt DESC")
    List<Workout> findByUserWithDateFilter(@Param("userId") UUID userId,
                                           @Param("dateFrom") LocalDate dateFrom,
                                           @Param("dateTo") LocalDate dateTo,
                                           Pageable pageable);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.user.id = :userId AND (:dateFrom IS NULL OR w.date >= :dateFrom) AND (:dateTo IS NULL OR w.date <= :dateTo)")
    long countByUserWithDateFilter(@Param("userId") UUID userId,
                                   @Param("dateFrom") LocalDate dateFrom,
                                   @Param("dateTo") LocalDate dateTo);

    @Query("SELECT DISTINCT w.date FROM Workout w WHERE w.user.id = :userId ORDER BY w.date DESC")
    List<LocalDate> findDistinctDatesByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT w.user.id) FROM Workout w WHERE w.date >= :since")
    long countActiveUsersSince(@Param("since") LocalDate since);

    @Query("SELECT MAX(w.date) FROM Workout w WHERE w.user.id = :userId")
    Optional<LocalDate> findLastWorkoutDate(@Param("userId") UUID userId);
}
