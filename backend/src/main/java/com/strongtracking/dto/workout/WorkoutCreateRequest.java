package com.strongtracking.dto.workout;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record WorkoutCreateRequest(
        @NotNull LocalDate date,
        String notes,
        Integer durationMinutes,
        @NotNull List<WorkoutSetCreateRequest> sets
) {}
