package com.app.loveecho.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.app.loveecho.dto.CommentResponseDTO;
import com.app.loveecho.dto.StoryResponseDTO;
import com.app.loveecho.dto.UserMiniDTO;
import com.app.loveecho.exception.ResourceNotFoundException;
import com.app.loveecho.model.Comment;
import com.app.loveecho.model.NotificationType;
import com.app.loveecho.model.Reaction;
import com.app.loveecho.model.Story;
import com.app.loveecho.model.StoryCategory;
import com.app.loveecho.model.User;
import com.app.loveecho.model.Visibility;
import com.app.loveecho.repository.StoryRepository;
import com.app.loveecho.repository.UserRepository;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;


    /* =========================
       CREATE STORY
    ========================== */
    public StoryResponseDTO createStory(Story story, String username) {

    story.setUserId(username);

    if (story.getCategory() == null) {
        story.setCategory(StoryCategory.GENERAL);
    }

    story.setHashtags(extractHashtags(story.getContent()));

    if (story.getVisibility() == null) {
        story.setVisibility(Visibility.PUBLIC);
    }

    story.setCreatedAt(LocalDateTime.now());
    story.setUpdatedAt(LocalDateTime.now());

    Story saved = storyRepository.save(story);
    return mapStoryToDTO(saved);
}


    /* =========================
       GET STORIES
    ========================== */
    public List<StoryResponseDTO> getAllPublicStories() {
        return storyRepository
                .findByVisibilityOrderByCreatedAtDesc(Visibility.PUBLIC)
                .stream()
                .map(this::mapStoryToDTO)
                .toList();
    }

    public List<StoryResponseDTO> getStoriesByUser(String username) {
        return storyRepository
                .findByUserIdAndVisibilityOrderByCreatedAtDesc(username, Visibility.PUBLIC)
                .stream()
                .map(this::mapStoryToDTO)
                .toList();
    }

    public List<StoryResponseDTO> getStoriesByHashtag(String tag) {
        return storyRepository
                .findByHashtagsAndVisibility(tag.toLowerCase(), Visibility.PUBLIC)
                .stream()
                .map(this::mapStoryToDTO)
                .toList();
    }

    /* =========================
       COMMENTS
    ========================== */
    public StoryResponseDTO addComment(String storyId, String text, String username) {

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (story.getVisibility() == Visibility.PRIVATE) {
            throw new RuntimeException("Cannot comment on private story");
        }

        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .userId(username)
                .createdAt(LocalDateTime.now())
                .build();

        story.getComments().add(comment);

        Story saved = storyRepository.save(story);

        // 🔔 NOTIFICATION: COMMENT
        notificationService.notifyUser(
                story.getUserId(),     // receiver (story owner)
                username,              // sender (commenter)
                story.getId(),
                NotificationType.COMMENT
        );

        return mapStoryToDTO(saved);
    }

    /* =========================
       REACTIONS
    ========================== */
    public StoryResponseDTO reactToStory(String storyId, String type, String username) {

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        // remove previous reaction by same user
        story.getReactions().removeIf(
                r -> r.getUserId().equals(username)
        );

        story.getReactions().add(
                Reaction.builder()
                        .userId(username)
                        .type(type)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        Story saved = storyRepository.save(story);

        // 🔔 NOTIFICATION: LIKE
        notificationService.notifyUser(
                story.getUserId(),     // receiver
                username,              // sender
                story.getId(),
                NotificationType.LIKE
        );

        return mapStoryToDTO(saved);
    }

    /* =========================
       DTO MAPPERS
    ========================== */
    public StoryResponseDTO mapStoryToDTO(Story story) {

        StoryResponseDTO dto = new StoryResponseDTO();

        dto.setId(story.getId());
        dto.setTitle(story.getTitle());
        dto.setContent(story.getContent());
        dto.setVisibility(story.getVisibility().name());
        dto.setCategory(story.getCategory().name());
        dto.setUserId(story.getUserId());
        dto.setCreatedAt(story.getCreatedAt());
        dto.setReactionsCount(
            story.getReactions() == null ? 0 : story.getReactions().size()
        );

        // Story user
        userRepository.findByUsername(story.getUserId())
                .ifPresent(user -> dto.setUser(mapUserToMiniDTO(user)));

        // Comments
        dto.setComments(
            story.getComments() == null
                ? List.of()
                : story.getComments().stream()
                    .map(this::mapCommentToDTO)
                    .toList()
        );


        return dto;
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment) {

        CommentResponseDTO.CommentResponseDTOBuilder builder =
                CommentResponseDTO.builder()
                        .id(comment.getId())
                        .text(comment.getText())
                        .createdAt(comment.getCreatedAt())
                        .userId(comment.getUserId());

        userRepository.findByUsername(comment.getUserId())
                .ifPresent(user -> builder
                        .username(user.getUsername())
                        .profileImageUrl(user.getProfileImageUrl()));

        return builder.build();
    }

    private UserMiniDTO mapUserToMiniDTO(User user) {
        return UserMiniDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    /* =========================
       UTIL
    ========================== */
    private List<String> extractHashtags(String content) {

        List<String> hashtags = new ArrayList<>();
        if (content == null) return hashtags;

        for (String word : content.split(" ")) {
            if (word.startsWith("#") && word.length() > 1) {
                hashtags.add(word.substring(1).toLowerCase());
            }
        }
        return hashtags;
    }

    public Page<StoryResponseDTO> getPagedPublicStories(Pageable pageable) {

        return storyRepository
                .findByVisibilityOrderByCreatedAtDesc(Visibility.PUBLIC, pageable)
                .map(this::mapStoryToDTO);
    }

    public Page<CommentResponseDTO> getPagedComments(
                String storyId,
                Pageable pageable
        ) {
            Story story = storyRepository.findById(storyId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Story not found"));

            List<Comment> comments =
                    story.getComments() == null
                            ? List.of()
                            : story.getComments();

            // sort manually (Mongo embedded list)
            List<Comment> sorted = comments.stream()
                    .sorted((a, b) ->
                            b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();

            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), sorted.size());

            List<CommentResponseDTO> pageContent =
                    start > end
                            ? List.of()
                            : sorted.subList(start, end)
                                    .stream()
                                    .map(this::mapCommentToDTO)
                                    .toList();

            return new PageImpl<>(
                    pageContent,
                    pageable,
                    sorted.size()
            );
    }
    public List<StoryResponseDTO> getMyPrivateStories(String username) {

        return storyRepository
                .findByUserIdAndVisibilityOrderByCreatedAtDesc(
                        username,
                        Visibility.PRIVATE
                )
                .stream()
                .map(this::mapStoryToDTO)
                .toList();
    }

    public StoryResponseDTO getStoryById(
        String storyId,
        Authentication authentication
) {
    Story story = storyRepository.findById(storyId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Story not found"));

    // PUBLIC story → anyone can see
    if (story.getVisibility() == Visibility.PUBLIC) {
        return mapStoryToDTO(story);
    }

    // PRIVATE story → only owner can see
    if (authentication == null) {
        throw new RuntimeException("Unauthorized");
    }

    String username = authentication.getName();

    if (!story.getUserId().equals(username)) {
        throw new RuntimeException("Access denied");
    }

    return mapStoryToDTO(story);
}

public StoryResponseDTO editStory(
        String storyId,
        Map<String, String> body,
        String username
) {
    Story story = storyRepository.findById(storyId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Story not found"));

    // 🔐 Ownership check
    if (!story.getUserId().equals(username)) {
        throw new RuntimeException("Access denied");
    }

    // ✏️ Update allowed fields
    if (body.containsKey("title")) {
        story.setTitle(body.get("title"));
    }

    if (body.containsKey("content")) {
        story.setContent(body.get("content"));
        story.setHashtags(extractHashtags(body.get("content")));
    }

    if (body.containsKey("visibility")) {
        story.setVisibility(
                Visibility.valueOf(body.get("visibility"))
        );
    }

    story.setUpdatedAt(LocalDateTime.now());

    return mapStoryToDTO(storyRepository.save(story));
}

public void deleteStory(String storyId, String username) {

    Story story = storyRepository.findById(storyId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Story not found"));

    // 🔐 Ownership check
    if (!story.getUserId().equals(username)) {
        throw new RuntimeException("Access denied");
    }

    storyRepository.delete(story);
}

public StoryResponseDTO toggleVisibility(String storyId, String username) {

    Story story = storyRepository.findById(storyId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Story not found"));

    // 🔐 Ownership check
    if (!story.getUserId().equals(username)) {
        throw new RuntimeException("Access denied");
    }

    // 🔄 Toggle
    if (story.getVisibility() == Visibility.PUBLIC) {
        story.setVisibility(Visibility.PRIVATE);
    } else {
        story.setVisibility(Visibility.PUBLIC);
    }

    story.setUpdatedAt(LocalDateTime.now());

    return mapStoryToDTO(storyRepository.save(story));
}

public List<StoryResponseDTO> getStoriesByCategory(String category) {

    // 🟢 Handle ALL / empty category
    if (category == null || category.equalsIgnoreCase("ALL")) {
        return storyRepository
                .findByVisibilityOrderByCreatedAtDesc(Visibility.PUBLIC)
                .stream()
                .map(this::mapStoryToDTO)
                .toList();
    }

    StoryCategory storyCategory;
    try {
        storyCategory = StoryCategory.valueOf(category.toUpperCase());
    } catch (IllegalArgumentException e) {
        throw new RuntimeException(
                "Invalid category. Allowed: GENERAL, HEALING, LOVE, HEARTBREAK, MOTIVATION, LIFE"
        );
    }

    return storyRepository
            .findByCategoryAndVisibilityOrderByCreatedAtDesc(
                    storyCategory,
                    Visibility.PUBLIC
            )
            .stream()
            .map(this::mapStoryToDTO)
            .toList();
}

public Page<StoryResponseDTO> searchStories(
        String query,
        Pageable pageable
) {
    if (query == null || query.trim().isEmpty()) {
        return Page.empty(pageable);
    }

    return storyRepository
            .findByVisibilityAndContentContainingIgnoreCaseOrTitleContainingIgnoreCase(
                    Visibility.PUBLIC,
                    query,
                    query,
                    pageable
            )
            .map(this::mapStoryToDTO);
}


}
