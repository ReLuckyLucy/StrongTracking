package com.strongtracking.dto.admin;

import java.util.List;

public record UserListResponse(
        List<UserAdminResponse> users,
        int total,
        int page,
        int pageSize
) {}
