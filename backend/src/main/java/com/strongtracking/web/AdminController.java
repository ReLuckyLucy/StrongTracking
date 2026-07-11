package com.strongtracking.web;

import com.strongtracking.dto.admin.AdminResetPasswordRequest;
import com.strongtracking.dto.admin.AdminStatsResponse;
import com.strongtracking.dto.admin.UserAdminResponse;
import com.strongtracking.dto.admin.UserListResponse;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public AdminStatsResponse stats(@AuthenticationPrincipal UserPrincipal principal) {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public UserListResponse listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return adminService.listUsers(page, pageSize, search);
    }

    @GetMapping("/users/{id}")
    public UserAdminResponse getUserDetail(@PathVariable UUID id,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return adminService.getUserDetail(id);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id,
                           @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteUser(id, principal.getId());
    }

    @PutMapping("/users/{id}/password")
    public Map<String, String> resetPassword(@PathVariable UUID id,
                                             @Valid @RequestBody AdminResetPasswordRequest request,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        adminService.resetPassword(id, request.password());
        return Map.of("detail", "Password updated");
    }
}
