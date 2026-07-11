package com.strongtracking.web;

import com.strongtracking.dto.stats.HeatmapPointResponse;
import com.strongtracking.dto.stats.OverviewResponse;
import com.strongtracking.dto.stats.ProgressPointResponse;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/progress/{exerciseId}")
    public List<ProgressPointResponse> progress(@PathVariable UUID exerciseId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getProgress(exerciseId, principal.getId());
    }

    @GetMapping("/heatmap")
    public List<HeatmapPointResponse> heatmap(@AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getHeatmap(principal.getId());
    }

    @GetMapping("/overview")
    public OverviewResponse overview(@AuthenticationPrincipal UserPrincipal principal) {
        return statsService.getOverview(principal.getId());
    }
}
