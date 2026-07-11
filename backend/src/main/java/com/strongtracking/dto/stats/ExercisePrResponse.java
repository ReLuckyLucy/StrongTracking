package com.strongtracking.dto.stats;

import java.time.LocalDate;
import java.util.UUID;

public record ExercisePrResponse(
        UUID exerciseId,
        String exerciseName,
        double maxWeight,
        LocalDate maxWeightDate
) {}
