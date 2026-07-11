package com.strongtracking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtConfig(String secret, long expirationMinutes, String algorithm) {
    public JwtConfig {
        if (algorithm == null || algorithm.isBlank()) {
            algorithm = "HS256";
        }
    }
}
