package com.strongtracking.service;

import com.strongtracking.dto.admin.AdminStatsResponse;
import com.strongtracking.dto.admin.UserAdminResponse;
import com.strongtracking.dto.admin.UserListResponse;
import com.strongtracking.model.Exercise;
import com.strongtracking.model.User;
import com.strongtracking.repository.ExerciseRepository;
import com.strongtracking.repository.UserRepository;
import com.strongtracking.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsResponse getStats() {
        var now = java.time.Instant.now();
        var weekAgo = now.minus(java.time.Duration.ofDays(7));

        int totalUsers = (int) userRepository.count();
        int totalWorkouts = (int) workoutRepository.count();
        int totalExercises = (int) exerciseRepository.count();
        int newUsersThisWeek = (int) userRepository.countByCreatedAtAfter(weekAgo);
        int activeUsersThisWeek = (int) workoutRepository.countActiveUsersSince(
                LocalDate.ofInstant(weekAgo, ZoneOffset.UTC));

        return new AdminStatsResponse(
                totalUsers, totalWorkouts, totalExercises, newUsersThisWeek, activeUsersThisWeek);
    }

    public UserListResponse listUsers(int page, int pageSize, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize);
        List<User> users;
        long total;

        if (search != null && !search.isBlank()) {
            users = userRepository.findByUsernameContainingOrEmailContaining(
                    search, pageRequest).getContent();
            total = userRepository.countByUsernameContainingOrEmailContaining(search);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc(pageRequest).getContent();
            total = userRepository.count();
        }

        List<UserAdminResponse> items = users.stream()
                .map(u -> {
                    int workoutCount = (int) workoutRepository.countByUserId(u.getId());
                    int exerciseCount = (int) exerciseRepository.countByUserId(u.getId());
                    LocalDate lastWorkoutDate = workoutRepository.findLastWorkoutDate(u.getId()).orElse(null);
                    return new UserAdminResponse(
                            u.getId(), u.getUsername(), u.getEmail(), u.isAdmin(),
                            u.getCreatedAt(), workoutCount, exerciseCount, lastWorkoutDate);
                })
                .toList();

        return new UserListResponse(items, (int) total, page, pageSize);
    }

    public UserAdminResponse getUserDetail(UUID userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        int workoutCount = (int) workoutRepository.countByUserId(u.getId());
        int exerciseCount = (int) exerciseRepository.countByUserId(u.getId());
        LocalDate lastWorkoutDate = workoutRepository.findLastWorkoutDate(u.getId()).orElse(null);

        return new UserAdminResponse(
                u.getId(), u.getUsername(), u.getEmail(), u.isAdmin(),
                u.getCreatedAt(), workoutCount, exerciseCount, lastWorkoutDate);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminId) {
        if (userId.equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete yourself");
        }
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(u);
    }

    @Transactional
    public void resetPassword(UUID userId, String newPassword) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        u.setHashedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }
}
