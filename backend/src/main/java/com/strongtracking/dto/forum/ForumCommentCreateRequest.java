package com.strongtracking.dto.forum;

import jakarta.validation.constraints.NotBlank;

public record ForumCommentCreateRequest(
        @NotBlank String content
) {}
