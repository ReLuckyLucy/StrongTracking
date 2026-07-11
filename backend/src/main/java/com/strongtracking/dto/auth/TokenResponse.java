package com.strongtracking.dto.auth;

public record TokenResponse(
        String accessToken,
        String tokenType
) {
    public TokenResponse(String accessToken) {
        this(accessToken, "bearer");
    }
}
