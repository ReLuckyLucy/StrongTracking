package com.strongtracking.dto.workout;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WorkoutResponse(
        UUID id,
        LocalDate date,
        String notes,
        Integer durationMinutes,
        Instant createdAt,
        List<WorkoutSetResponse> sets
) {}
