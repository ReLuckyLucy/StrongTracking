package com.strongtracking.service;

import com.strongtracking.dto.forum.*;
import com.strongtracking.model.*;
import com.strongtracking.repository.ForumCommentRepository;
import com.strongtracking.repository.ForumLikeRepository;
import com.strongtracking.repository.ForumPostRepository;
import com.strongtracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ForumLikeRepository forumLikeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ForumPostListItemResponse> listPosts(int page, int perPage) {
        PageRequest pageRequest = PageRequest.of(page - 1, perPage);
        return forumPostRepository.findAllOrderByCreatedAtDesc(pageRequest)
                .stream()
                .map(p -> new ForumPostListItemResponse(
                        p.getId(),
                        p.getTitle(),
                        p.getContent().length() > 100
                                ? p.getContent().substring(0, 100) + "..."
                                : p.getContent(),
                        new ForumAuthorResponse(p.getUser().getId(), p.getUser().getUsername()),
                        p.getCreatedAt(),
                        p.getComments().size(),
                        p.getLikes().size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ForumPostResponse getPost(UUID postId, UUID currentUserId) {
        ForumPost post = forumPostRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        List<ForumComment> comments = forumCommentRepository.findByPostIdWithUser(postId);

        List<ForumCommentResponse> commentResponses = comments.stream()
                .map(c -> new ForumCommentResponse(
                        c.getId(),
                        c.getContent(),
                        new ForumAuthorResponse(c.getUser().getId(), c.getUser().getUsername()),
                        c.getCreatedAt()))
                .toList();

        boolean likedByCurrentUser = forumLikeRepository.existsByPostIdAndUserId(postId, currentUserId);
        int likeCount = (int) forumLikeRepository.countByPostId(postId);

        return new ForumPostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                new ForumAuthorResponse(post.getUser().getId(), post.getUser().getUsername()),
                post.getCreatedAt(),
                commentResponses.size(),
                likeCount,
                likedByCurrentUser,
                commentResponses);
    }

    @Transactional
    public ForumPostResponse createPost(ForumPostCreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ForumPost post = ForumPost.builder()
                .user(user)
                .title(request.title())
                .content(request.content())
                .build();
        forumPostRepository.saveAndFlush(post);

        return new ForumPostResponse(
                post.getId(), post.getTitle(), post.getContent(),
                new ForumAuthorResponse(user.getId(), user.getUsername()),
                post.getCreatedAt(), 0, 0, false, List.of());
    }

    @Transactional
    public void deletePost(UUID postId, UUID userId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }

        forumPostRepository.delete(post);
    }

    @Transactional
    public ForumCommentResponse addComment(UUID postId, ForumCommentCreateRequest request, UUID userId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ForumComment comment = ForumComment.builder()
                .post(post)
                .user(user)
                .content(request.content())
                .build();
        forumCommentRepository.save(comment);

        return new ForumCommentResponse(
                comment.getId(), comment.getContent(),
                new ForumAuthorResponse(user.getId(), user.getUsername()),
                comment.getCreatedAt());
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        forumCommentRepository.delete(comment);
    }

    @Transactional
    public boolean toggleLike(UUID postId, UUID userId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        var existingLike = forumLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            forumLikeRepository.delete(existingLike.get());
            return false;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ForumLike like = ForumLike.builder()
                .post(post)
                .user(user)
                .build();
        forumLikeRepository.save(like);
        return true;
    }
}
