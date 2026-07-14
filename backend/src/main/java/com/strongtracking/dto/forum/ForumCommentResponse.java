package com.strongtracking.dto.forum;

import java.time.Instant;
import java.util.UUID;

public record ForumCommentResponse(
        UUID id,
        String content,
        ForumAuthorResponse author,
        Instant created_at
) {}
