package com.strongtracking.web;

import com.strongtracking.dto.forum.*;
import com.strongtracking.security.UserPrincipal;
import com.strongtracking.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/posts")
    public List<ForumPostListItemResponse> listPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage) {
        return forumService.listPosts(page, perPage);
    }

    @GetMapping("/posts/{id}")
    public ForumPostResponse getPost(@PathVariable UUID id,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        return forumService.getPost(id, principal.getId());
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ForumPostResponse createPost(@Valid @RequestBody ForumPostCreateRequest request,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        return forumService.createPost(request, principal.getId());
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable UUID id,
                           @AuthenticationPrincipal UserPrincipal principal) {
        forumService.deletePost(id, principal.getId());
    }

    @PostMapping("/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ForumCommentResponse addComment(@PathVariable UUID id,
                                           @Valid @RequestBody ForumCommentCreateRequest request,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return forumService.addComment(id, request, principal.getId());
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID id,
                              @AuthenticationPrincipal UserPrincipal principal) {
        forumService.deleteComment(id, principal.getId());
    }

    public record LikeResponse(boolean liked) {}

    @PostMapping("/posts/{id}/like")
    public LikeResponse toggleLike(@PathVariable UUID id,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        boolean liked = forumService.toggleLike(id, principal.getId());
        return new LikeResponse(liked);
    }
}
