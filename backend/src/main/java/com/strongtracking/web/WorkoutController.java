package com.strongtracking.web;

import com.strongtracking.dto.workout.*;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public List<WorkoutListItemResponse> listWorkouts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo) {
        return workoutService.listWorkouts(principal.getId(), page, perPage, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public WorkoutResponse getWorkout(@PathVariable UUID id,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        return workoutService.getWorkout(id, principal.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutResponse createWorkout(@Valid @RequestBody WorkoutCreateRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return workoutService.createWorkout(request, principal.getId());
    }

    @PutMapping("/{id}")
    public WorkoutResponse updateWorkout(@PathVariable UUID id,
                                         @Valid @RequestBody WorkoutUpdateRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return workoutService.updateWorkout(id, request, principal.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkout(@PathVariable UUID id,
                              @AuthenticationPrincipal UserPrincipal principal) {
        workoutService.deleteWorkout(id, principal.getId());
    }
}
