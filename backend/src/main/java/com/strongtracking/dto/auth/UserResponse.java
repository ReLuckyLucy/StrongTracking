package com.strongtracking.dto.auth;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        boolean isAdmin,
        Instant createdAt
) {}
