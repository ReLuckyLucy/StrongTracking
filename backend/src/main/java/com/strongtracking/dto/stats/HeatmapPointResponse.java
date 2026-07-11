package com.strongtracking.dto.stats;

import java.time.LocalDate;

public record HeatmapPointResponse(
        LocalDate date,
        int count
) {}
