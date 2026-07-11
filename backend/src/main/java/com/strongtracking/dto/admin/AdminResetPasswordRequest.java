package com.strongtracking.dto.admin;

import jakarta.validation.constraints.Size;

public record AdminResetPasswordRequest(
        @Size(min = 6, max = 128) String password
) {}
