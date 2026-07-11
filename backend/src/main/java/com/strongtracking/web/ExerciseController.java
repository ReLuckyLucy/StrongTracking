package com.strongtracking.web;

import com.strongtracking.dto.exercise.ExerciseCreateRequest;
import com.strongtracking.dto.exercise.ExerciseResponse;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public List<ExerciseResponse> listExercises(@AuthenticationPrincipal UserPrincipal principal) {
        return exerciseService.listExercises(principal.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciseResponse createExercise(@Valid @RequestBody ExerciseCreateRequest request,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return exerciseService.createExercise(request, principal.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExercise(@PathVariable UUID id,
                               @AuthenticationPrincipal UserPrincipal principal) {
        exerciseService.deleteExercise(id, principal.getId());
    }
}
