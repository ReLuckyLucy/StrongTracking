package com.strongtracking.dto.workout;

import java.util.UUID;

public record WorkoutSetResponse(
        UUID id,
        UUID exerciseId,
        String exerciseName,
        int setNumber,
        double weightKg,
        int reps
) {}
