package com.strongtracking.dto.workout;

import java.time.LocalDate;
import java.util.List;

public record WorkoutUpdateRequest(
        LocalDate date,
        String notes,
        Integer durationMinutes,
        List<WorkoutSetCreateRequest> sets
) {}
