package com.strongtracking.dto.forum;

import java.util.UUID;

public record ForumAuthorResponse(
        UUID id,
        String username
) {}
