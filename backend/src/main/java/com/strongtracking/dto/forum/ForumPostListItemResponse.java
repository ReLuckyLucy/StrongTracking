package com.strongtracking.dto.forum;

import java.time.Instant;
import java.util.UUID;

public record ForumPostListItemResponse(
        UUID id,
        String title,
        String content_preview,
        ForumAuthorResponse author,
        Instant created_at,
        int comment_count,
        int like_count
) {}
