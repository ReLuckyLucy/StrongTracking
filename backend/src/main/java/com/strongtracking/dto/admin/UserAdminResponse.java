package com.strongtracking.dto.admin;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record UserAdminResponse(
        UUID id,
        String username,
        String email,
        boolean isAdmin,
        Instant createdAt,
        int workoutCount,
        int exerciseCount,
        LocalDate lastWorkoutDate
) {}
