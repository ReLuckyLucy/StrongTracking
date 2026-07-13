package com.strongtracking.service;

import com.strongtracking.dto.stats.*;
import com.strongtracking.model.Workout;
import com.strongtracking.model.WorkoutSet;
import com.strongtracking.repository.ExerciseRepository;
import com.strongtracking.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public List<ProgressPointResponse> getProgress(UUID exerciseId, UUID userId) {
        exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        List<Workout> workouts = workoutRepository.findByUserWithDateFilter(
                userId, null, null, org.springframework.data.domain.Pageable.unpaged());

        // Group by date: collect all WorkoutSet for this exercise across workouts
        Map<LocalDate, List<WorkoutSet>> setsByDate = new LinkedHashMap<>();
        for (Workout w : workouts) {
            for (WorkoutSet s : w.getSets()) {
                if (s.getExercise().getId().equals(exerciseId)) {
                    setsByDate.computeIfAbsent(w.getDate(), k -> new ArrayList<>()).add(s);
                }
            }
        }

        List<ProgressPointResponse> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<WorkoutSet>> entry : setsByDate.entrySet()) {
            List<WorkoutSet> sets = entry.getValue();
            double maxWeight = sets.stream().mapToDouble(WorkoutSet::getWeightKg).max().orElse(0);
            double avgWeight = sets.stream().mapToDouble(WorkoutSet::getWeightKg).average().orElse(0);
            result.add(new ProgressPointResponse(
                    entry.getKey(),
                    Math.round(maxWeight * 10.0) / 10.0,
                    Math.round(avgWeight * 10.0) / 10.0
            ));
        }

        result.sort(Comparator.comparing(ProgressPointResponse::date));
        return result;
    }

    public List<HeatmapPointResponse> getHeatmap(UUID userId) {
        List<Workout> workouts = workoutRepository.findByUserWithDateFilter(
                userId, null, null, org.springframework.data.domain.Pageable.unpaged());

        Map<LocalDate, Long> countByDate = workouts.stream()
                .collect(Collectors.groupingBy(Workout::getDate, Collectors.counting()));

        return countByDate.entrySet().stream()
                .map(e -> new HeatmapPointResponse(e.getKey(), e.getValue().intValue()))
                .sorted(Comparator.comparing(HeatmapPointResponse::date))
                .toList();
    }

    public OverviewResponse getOverview(UUID userId) {
        long totalWorkouts = workoutRepository.countByUserId(userId);

        List<LocalDate> dates = workoutRepository.findDistinctDatesByUserId(userId);
        // dates are sorted DESC

        // Calculate streaks
        int currentStreak = 0;
        int longestStreak = 0;
        LocalDate today = LocalDate.now();

        if (!dates.isEmpty()) {
            // Current streak
            if (today.toEpochDay() - dates.get(0).toEpochDay() <= 1) {
                currentStreak = 1;
                for (int i = 1; i < dates.size(); i++) {
                    if (dates.get(i - 1).toEpochDay() - dates.get(i).toEpochDay() == 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }

            // Longest streak
            int streak = 1;
            for (int i = 1; i < dates.size(); i++) {
                if (dates.get(i - 1).toEpochDay() - dates.get(i).toEpochDay() == 1) {
                    streak++;
                } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, streak);
        }

        // Per-exercise PRs
        List<Workout> workouts = workoutRepository.findByUserWithDateFilter(
                userId, null, null, org.springframework.data.domain.Pageable.unpaged());

        // Map: exerciseId -> { maxWeight, date }
        record PrData(double maxWeight, LocalDate date) {}
        Map<UUID, PrData> prMap = new HashMap<>();
        Map<UUID, String> exerciseNames = new HashMap<>();

        for (Workout w : workouts) {
            for (WorkoutSet s : w.getSets()) {
                UUID exId = s.getExercise().getId();
                exerciseNames.putIfAbsent(exId, s.getExercise().getName());
                PrData current = prMap.get(exId);
                if (current == null || s.getWeightKg() > current.maxWeight()) {
                    prMap.put(exId, new PrData(s.getWeightKg(), w.getDate()));
                } else if (s.getWeightKg() == current.maxWeight() && w.getDate().isAfter(current.date())) {
                    prMap.put(exId, new PrData(current.maxWeight(), w.getDate()));
                }
            }
        }

        List<ExercisePrResponse> prs = prMap.entrySet().stream()
                .map(e -> new ExercisePrResponse(
                        e.getKey(),
                        exerciseNames.get(e.getKey()),
                        Math.round(e.getValue().maxWeight() * 10.0) / 10.0,
                        e.getValue().date()
                ))
                .sorted((a, b) -> Double.compare(b.maxWeight(), a.maxWeight()))
                .toList();

        return new OverviewResponse((int) totalWorkouts, currentStreak, longestStreak, prs);
    }
}
