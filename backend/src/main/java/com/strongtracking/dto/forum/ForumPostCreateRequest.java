package com.strongtracking.dto.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForumPostCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String content
) {}
