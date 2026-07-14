package com.strongtracking.dto.forum;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ForumPostResponse(
        UUID id,
        String title,
        String content,
        ForumAuthorResponse author,
        Instant created_at,
        int comment_count,
        int like_count,
        boolean liked_by_current_user,
        List<ForumCommentResponse> comments
) {}
