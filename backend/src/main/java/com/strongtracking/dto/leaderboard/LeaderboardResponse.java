package com.strongtracking.dto.leaderboard;

import java.util.List;
import java.util.UUID;

/**
 * 排行榜响应。
 *
 * @param metric            排序指标: workouts / volume / streak / weight
 * @param period            统计周期: all / month / week
 * @param exerciseId        动作榜对应的动作 id（普通榜为 null）
 * @param exerciseName      动作榜对应的动作名称（普通榜为 null）
 * @param totalParticipants 参与排名的用户总数
 * @param myEntry           当前用户的排名（未上榜或无数据时为 null）
 * @param entries           排行榜条目
 */
public record LeaderboardResponse(
        String metric,
        String period,
        UUID exerciseId,
        String exerciseName,
        int totalParticipants,
        LeaderboardEntryResponse myEntry,
        List<LeaderboardEntryResponse> entries
) {}
