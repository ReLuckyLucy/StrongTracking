package com.strongtracking.dto.workout;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record WorkoutSetCreateRequest(
        @NotNull UUID exerciseId,
        @Min(1) int setNumber,
        @Min(0) double weightKg,
        @Min(0) int reps
) {}
