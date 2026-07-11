package com.strongtracking.service;

import com.strongtracking.dto.workout.*;
import com.strongtracking.model.Exercise;
import com.strongtracking.model.User;
import com.strongtracking.model.Workout;
import com.strongtracking.model.WorkoutSet;
import com.strongtracking.repository.ExerciseRepository;
import com.strongtracking.repository.UserRepository;
import com.strongtracking.repository.WorkoutRepository;
import com.strongtracking.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public List<WorkoutListItemResponse> listWorkouts(UUID userId, int page, int perPage,
                                                       LocalDate dateFrom, LocalDate dateTo) {
        PageRequest pageRequest = PageRequest.of(page - 1, perPage);
        List<Workout> workouts = workoutRepository.findByUserWithDateFilter(userId, dateFrom, dateTo, pageRequest);

        return workouts.stream()
                .map(w -> {
                    int exerciseCount = (int) w.getSets().stream()
                            .map(s -> s.getExercise().getId())
                            .distinct()
                            .count();
                    return new WorkoutListItemResponse(
                            w.getId(), w.getDate(), w.getNotes(), w.getDurationMinutes(), exerciseCount);
                })
                .toList();
    }

    public WorkoutResponse getWorkout(UUID workoutId, UUID userId) {
        Workout workout = workoutRepository.findByIdWithSets(workoutId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        List<WorkoutSetResponse> setResponses = workout.getSets().stream()
                .map(s -> new WorkoutSetResponse(
                        s.getId(),
                        s.getExercise().getId(),
                        s.getExercise().getName(),
                        s.getSetNumber(),
                        s.getWeightKg(),
                        s.getReps()
                ))
                .toList();

        return new WorkoutResponse(
                workout.getId(), workout.getDate(), workout.getNotes(),
                workout.getDurationMinutes(), workout.getCreatedAt(), setResponses);
    }

    @Transactional
    public WorkoutResponse createWorkout(WorkoutCreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Workout workout = Workout.builder()
                .user(user)
                .date(request.date())
                .notes(request.notes())
                .durationMinutes(request.durationMinutes())
                .build();
        workoutRepository.saveAndFlush(workout);

        for (WorkoutSetCreateRequest sData : request.sets()) {
            Exercise exercise = exerciseRepository.findById(sData.exerciseId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Exercise " + sData.exerciseId() + " not found"));

            WorkoutSet set = WorkoutSet.builder()
                    .workout(workout)
                    .exercise(exercise)
                    .setNumber(sData.setNumber())
                    .weightKg(sData.weightKg())
                    .reps(sData.reps())
                    .build();
            workoutSetRepository.save(set);
        }

        workoutSetRepository.flush();
        return getWorkout(workout.getId(), userId);
    }

    @Transactional
    public WorkoutResponse updateWorkout(UUID workoutId, WorkoutUpdateRequest request, UUID userId) {
        Workout workout = workoutRepository.findByIdWithSets(workoutId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        if (request.date() != null) {
            workout.setDate(request.date());
        }
        if (request.notes() != null) {
            workout.setNotes(request.notes());
        }
        if (request.durationMinutes() != null) {
            workout.setDurationMinutes(request.durationMinutes());
        }

        if (request.sets() != null) {
            workoutSetRepository.deleteByWorkoutId(workout.getId());
            workoutSetRepository.flush();

            for (WorkoutSetCreateRequest sData : request.sets()) {
                Exercise exercise = exerciseRepository.findById(sData.exerciseId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Exercise " + sData.exerciseId() + " not found"));

                WorkoutSet set = WorkoutSet.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .setNumber(sData.setNumber())
                        .weightKg(sData.weightKg())
                        .reps(sData.reps())
                        .build();
                workoutSetRepository.save(set);
            }
        }

        workoutRepository.flush();
        return getWorkout(workout.getId(), userId);
    }

    @Transactional
    public void deleteWorkout(UUID workoutId, UUID userId) {
        Workout workout = workoutRepository.findByIdWithSets(workoutId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
        workoutRepository.delete(workout);
    }
}
