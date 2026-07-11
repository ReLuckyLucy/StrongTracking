package com.strongtracking.dto.workout;

import java.time.LocalDate;
import java.util.UUID;

public record WorkoutListItemResponse(
        UUID id,
        LocalDate date,
        String notes,
        Integer durationMinutes,
        int exerciseCount
) {}
