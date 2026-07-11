package com.strongtracking.dto.admin;

public record AdminStatsResponse(
        int totalUsers,
        int totalWorkouts,
        int totalExercises,
        int newUsersThisWeek,
        int activeUsersThisWeek
) {}
