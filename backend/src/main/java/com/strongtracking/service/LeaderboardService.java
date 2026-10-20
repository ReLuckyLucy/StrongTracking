package com.strongtracking.service;

import com.strongtracking.dto.leaderboard.LeaderboardEntryResponse;
import com.strongtracking.dto.leaderboard.LeaderboardResponse;
import com.strongtracking.model.Exercise;
import com.strongtracking.model.User;
import com.strongtracking.repository.ExerciseRepository;
import com.strongtracking.repository.UserRepository;
import com.strongtracking.repository.WorkoutLeaderboardRepository;
import com.strongtracking.repository.projection.UserVolumeAggregate;
import com.strongtracking.repository.projection.UserWorkoutAggregate;
import com.strongtracking.repository.projection.UserWorkoutDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    public static final String METRIC_WORKOUTS = "workouts";
    public static final String METRIC_VOLUME = "volume";
    public static final String METRIC_STREAK = "streak";
    public static final String METRIC_WEIGHT = "weight";

    public static final String PERIOD_ALL = "all";
    public static final String PERIOD_MONTH = "month";
    public static final String PERIOD_WEEK = "week";

    private final WorkoutLeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(String metric, String period, UUID exerciseId, UUID currentUserId) {
        String normalizedMetric = normalizeMetric(metric);
        String normalizedPeriod = normalizePeriod(period);
        boolean exerciseScope = exerciseId != null;

        Exercise exercise = null;
        if (exerciseScope) {
            exercise = exerciseRepository.findById(exerciseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        }

        LocalDate[] range = resolveRange(normalizedPeriod);
        LocalDate dateFrom = range[0];
        LocalDate dateTo = range[1];

        // 训练次数聚合（动作榜同样按训练次数统计参与人数）
        Map<UUID, Long> workoutCounts = leaderboardRepository.countWorkoutsPerUser(dateFrom, dateTo).stream()
                .collect(Collectors.toMap(UserWorkoutAggregate::getUserId,
                        UserWorkoutAggregate::getWorkoutCount,
                        (a, b) -> a,
                        LinkedHashMap::new));

        // 容量 / 最大重量聚合
        List<UserVolumeAggregate> volumeAggregates = exerciseScope
                ? leaderboardRepository.aggregateVolumePerUserForExercise(exerciseId, dateFrom, dateTo)
                : leaderboardRepository.aggregateVolumePerUser(dateFrom, dateTo);

        Map<UUID, UserVolumeAggregate> volumeByUser = volumeAggregates.stream()
                .collect(Collectors.toMap(UserVolumeAggregate::getUserId, Function.identity(),
                        (a, b) -> a, LinkedHashMap::new));

        // 连续打卡天数始终基于完整历史计算，不受统计周期影响
        Map<UUID, int[]> streaks = calculateStreaks(leaderboardRepository.findWorkoutDates(null, null));

        // 参与用户集合：有训练次数或有训练容量的用户
        List<UUID> participantIds = new ArrayList<>();
        workoutCounts.keySet().forEach(id -> {
            if (!participantIds.contains(id)) participantIds.add(id);
        });
        volumeByUser.keySet().forEach(id -> {
            if (!participantIds.contains(id)) participantIds.add(id);
        });

        // 用户名
        Map<UUID, String> usernames = new HashMap<>();
        for (UUID id : participantIds) {
            userRepository.findById(id).ifPresent(u -> usernames.put(id, u.getUsername()));
        }

        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        for (UUID id : participantIds) {
            UserVolumeAggregate vol = volumeByUser.get(id);
            int[] streak = streaks.getOrDefault(id, new int[]{0, 0});
            entries.add(new LeaderboardEntryResponse(
                    0,
                    id,
                    usernames.getOrDefault(id, "未知用户"),
                    workoutCounts.getOrDefault(id, 0L).intValue(),
                    round(vol == null ? 0 : vol.getTotalVolume()),
                    round(vol == null ? 0 : vol.getMaxWeight()),
                    streak[0],
                    streak[1]));
        }

        Comparator<LeaderboardEntryResponse> comparator = comparatorFor(normalizedMetric);
        entries.sort(comparator
                .thenComparing(LeaderboardEntryResponse::userId));

        // 计算名次（同值同名次）
        List<LeaderboardEntryResponse> ranked = new ArrayList<>(entries.size());
        int rank = 0;
        int index = 0;
        LeaderboardEntryResponse previous = null;
        for (LeaderboardEntryResponse entry : entries) {
            index++;
            if (previous == null || comparator.compare(entry, previous) != 0) {
                rank = index;
                previous = entry;
            }
            ranked.add(new LeaderboardEntryResponse(
                    rank,
                    entry.userId(),
                    entry.username(),
                    entry.workoutCount(),
                    entry.totalVolume(),
                    entry.maxWeight(),
                    entry.currentStreak(),
                    entry.longestStreak()));
        }

        int limit = Math.min(ranked.size(), 100);
        List<LeaderboardEntryResponse> top = ranked.subList(0, limit);

        LeaderboardEntryResponse myEntry = ranked.stream()
                .filter(e -> e.userId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        return new LeaderboardResponse(
                normalizedMetric,
                normalizedPeriod,
                exercise == null ? null : exercise.getId(),
                exercise == null ? null : exercise.getName(),
                ranked.size(),
                myEntry,
                top);
    }

    private String normalizeMetric(String metric) {
        if (metric == null) return METRIC_WORKOUTS;
        return switch (metric.toLowerCase()) {
            case METRIC_VOLUME -> METRIC_VOLUME;
            case METRIC_STREAK -> METRIC_STREAK;
            case METRIC_WEIGHT -> METRIC_WEIGHT;
            default -> METRIC_WORKOUTS;
        };
    }

    private String normalizePeriod(String period) {
        if (period == null) return PERIOD_ALL;
        return switch (period.toLowerCase()) {
            case PERIOD_MONTH -> PERIOD_MONTH;
            case PERIOD_WEEK -> PERIOD_WEEK;
            default -> PERIOD_ALL;
        };
    }

    /**
     * 返回统计区间的 [起始日期, 结束日期]，null 表示不限。
     */
    private LocalDate[] resolveRange(String period) {
        LocalDate today = LocalDate.now();
        return switch (period) {
            case PERIOD_WEEK -> new LocalDate[]{today.minusDays(6), today};
            case PERIOD_MONTH -> new LocalDate[]{today.withDayOfMonth(1), today};
            default -> new LocalDate[]{null, null};
        };
    }

    private Comparator<LeaderboardEntryResponse> comparatorFor(String metric) {
        return switch (metric) {
            case METRIC_VOLUME -> Comparator.comparingDouble(LeaderboardEntryResponse::totalVolume).reversed()
                    .thenComparing(Comparator.comparingInt(LeaderboardEntryResponse::workoutCount).reversed());
            case METRIC_STREAK -> Comparator.comparingInt(LeaderboardEntryResponse::currentStreak).reversed()
                    .thenComparing(Comparator.comparingInt(LeaderboardEntryResponse::longestStreak).reversed());
            case METRIC_WEIGHT -> Comparator.comparingDouble(LeaderboardEntryResponse::maxWeight).reversed()
                    .thenComparing(Comparator.comparingInt(LeaderboardEntryResponse::workoutCount).reversed());
            default -> Comparator.comparingInt(LeaderboardEntryResponse::workoutCount).reversed()
                    .thenComparing(Comparator.comparingDouble(LeaderboardEntryResponse::totalVolume).reversed());
        };
    }

    /**
     * 计算每个用户的当前连续天数与最长连续天数。
     * 返回 Map&lt;userId, int[]{current, longest}&gt;。
     */
    private Map<UUID, int[]> calculateStreaks(List<UserWorkoutDate> dates) {
        Map<UUID, List<LocalDate>> byUser = new HashMap<>();
        for (UserWorkoutDate d : dates) {
            byUser.computeIfAbsent(d.getUserId(), k -> new ArrayList<>()).add(d.getWorkoutDate());
        }

        LocalDate today = LocalDate.now();
        Map<UUID, int[]> result = new HashMap<>();

        for (Map.Entry<UUID, List<LocalDate>> entry : byUser.entrySet()) {
            List<LocalDate> userDates = entry.getValue().stream().distinct().sorted().toList();
            if (userDates.isEmpty()) continue;

            result.put(entry.getKey(), new int[]{
                    currentStreak(userDates, today),
                    longestStreak(userDates)
            });
        }
        return result;
    }

    private int longestStreak(List<LocalDate> sortedDistinctDates) {
        if (sortedDistinctDates.isEmpty()) return 0;
        int best = 1;
        int run = 1;
        for (int i = 1; i < sortedDistinctDates.size(); i++) {
            if (sortedDistinctDates.get(i).toEpochDay() - sortedDistinctDates.get(i - 1).toEpochDay() == 1) {
                run++;
            } else {
                run = 1;
            }
            best = Math.max(best, run);
        }
        return best;
    }

    private int currentStreak(List<LocalDate> sortedDistinctDates, LocalDate today) {
        if (sortedDistinctDates.isEmpty()) return 0;
        LocalDate last = sortedDistinctDates.get(sortedDistinctDates.size() - 1);
        long gapToToday = today.toEpochDay() - last.toEpochDay();
        if (gapToToday > 1) return 0;

        int streak = 1;
        for (int i = sortedDistinctDates.size() - 1; i > 0; i--) {
            if (sortedDistinctDates.get(i).toEpochDay() - sortedDistinctDates.get(i - 1).toEpochDay() == 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
