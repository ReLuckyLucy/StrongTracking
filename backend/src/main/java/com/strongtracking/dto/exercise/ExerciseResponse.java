package com.strongtracking.dto.exercise;

import java.util.UUID;

public record ExerciseResponse(
        UUID id,
        String name,
        String category,
        String description,
        UUID userId
) {}
