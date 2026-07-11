package com.strongtracking.repository;

import com.strongtracking.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, UUID> {

    @Modifying
    @Query("DELETE FROM WorkoutSet ws WHERE ws.workout.id = :workoutId")
    void deleteByWorkoutId(@Param("workoutId") UUID workoutId);
}
