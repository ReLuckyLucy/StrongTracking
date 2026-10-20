package com.strongtracking.web;

import com.strongtracking.dto.leaderboard.LeaderboardResponse;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * 查询排行榜。
     *
     * @param metric 排序指标: workouts / volume / streak / weight
     * @param period 统计周期: all / month / week
     * @param exerciseId 可选，指定后仅统计该动作的成绩
     */
    @GetMapping
    public LeaderboardResponse leaderboard(
            @RequestParam(defaultValue = "workouts") String metric,
            @RequestParam(defaultValue = "all") String period,
            @RequestParam(required = false) UUID exerciseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return leaderboardService.getLeaderboard(metric, period, exerciseId, principal.getId());
    }
}
