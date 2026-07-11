package com.strongtracking.service;

import com.strongtracking.config.JwtConfig;
import com.strongtracking.dto.auth.LoginRequest;
import com.strongtracking.dto.auth.RegisterRequest;
import com.strongtracking.dto.auth.TokenResponse;
import com.strongtracking.dto.auth.UserResponse;
import com.strongtracking.model.User;
import com.strongtracking.repository.UserRepository;
import com.strongtracking.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .hashedPassword(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);

        String token = jwtTokenProvider.createToken(user.getId());
        return new TokenResponse(token);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getHashedPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtTokenProvider.createToken(user.getId());
        return new TokenResponse(token);
    }

    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.isAdmin(), user.getCreatedAt());
    }
}
