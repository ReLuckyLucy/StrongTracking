package com.strongtracking.dto.leaderboard;

import java.util.UUID;

/**
 * 排行榜中的一条排名记录。
 */
public record LeaderboardEntryResponse(
        int rank,
        UUID userId,
        String username,
        int workoutCount,
        double totalVolume,
        double maxWeight,
        int currentStreak,
        int longestStreak
) {}
