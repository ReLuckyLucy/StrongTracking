package com.strongtracking.dto.stats;

import java.time.LocalDate;

public record ProgressPointResponse(
        LocalDate date,
        double maxWeight,
        double avgWeight
) {}
