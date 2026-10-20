package com.strongtracking.repository;

import com.strongtracking.repository.projection.UserVolumeAggregate;
import com.strongtracking.repository.projection.UserWorkoutAggregate;
import com.strongtracking.repository.projection.UserWorkoutDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 排行榜专用聚合查询，避免逐用户查询导致的 N+1。
 */
@Repository
public interface WorkoutLeaderboardRepository extends JpaRepository<com.strongtracking.model.Workout, UUID> {

    /**
     * 每个用户的训练次数（可选按日期范围过滤）。
     */
    @Query("""
            SELECT w.user.id AS userId, COUNT(w) AS workoutCount
            FROM Workout w
            WHERE (:dateFrom IS NULL OR w.date >= :dateFrom)
              AND (:dateTo IS NULL OR w.date <= :dateTo)
            GROUP BY w.user.id
            """)
    List<UserWorkoutAggregate> countWorkoutsPerUser(@Param("dateFrom") LocalDate dateFrom,
                                                     @Param("dateTo") LocalDate dateTo);

    /**
     * 每个用户的训练容量（重量 x 次数之和）与最大单组重量。
     */
    @Query("""
            SELECT w.user.id AS userId,
                   SUM(ws.weightKg * ws.reps) AS totalVolume,
                   MAX(ws.weightKg) AS maxWeight
            FROM WorkoutSet ws
            JOIN ws.workout w
            WHERE (:dateFrom IS NULL OR w.date >= :dateFrom)
              AND (:dateTo IS NULL OR w.date <= :dateTo)
            GROUP BY w.user.id
            """)
    List<UserVolumeAggregate> aggregateVolumePerUser(@Param("dateFrom") LocalDate dateFrom,
                                                      @Param("dateTo") LocalDate dateTo);

    /**
     * 每个用户在指定动作上的最大重量。
     */
    @Query("""
            SELECT w.user.id AS userId,
                   SUM(ws.weightKg * ws.reps) AS totalVolume,
                   MAX(ws.weightKg) AS maxWeight
            FROM WorkoutSet ws
            JOIN ws.workout w
            WHERE ws.exercise.id = :exerciseId
              AND (:dateFrom IS NULL OR w.date >= :dateFrom)
              AND (:dateTo IS NULL OR w.date <= :dateTo)
            GROUP BY w.user.id
            """)
    List<UserVolumeAggregate> aggregateVolumePerUserForExercise(@Param("exerciseId") UUID exerciseId,
                                                                 @Param("dateFrom") LocalDate dateFrom,
                                                                 @Param("dateTo") LocalDate dateTo);

    /**
     * 所有用户的训练日期（用于计算连续打卡天数）。
     */
    @Query("""
            SELECT w.user.id AS userId, w.date AS workoutDate
            FROM Workout w
            WHERE (:dateFrom IS NULL OR w.date >= :dateFrom)
              AND (:dateTo IS NULL OR w.date <= :dateTo)
            ORDER BY w.user.id ASC, w.date DESC
            """)
    List<UserWorkoutDate> findWorkoutDates(@Param("dateFrom") LocalDate dateFrom,
                                           @Param("dateTo") LocalDate dateTo);
}
