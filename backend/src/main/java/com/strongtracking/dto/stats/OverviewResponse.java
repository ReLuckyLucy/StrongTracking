package com.strongtracking.dto.stats;

import java.util.List;

public record OverviewResponse(
        int totalWorkouts,
        int currentStreak,
        int longestStreak,
        List<ExercisePrResponse> exercisePrs
) {}
