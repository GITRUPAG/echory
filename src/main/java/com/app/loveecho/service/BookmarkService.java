package com.app.loveecho.service;

import com.app.loveecho.dto.StoryResponseDTO;
import com.app.loveecho.model.Bookmark;
import com.app.loveecho.model.NotificationType;
import com.app.loveecho.model.Story;
import com.app.loveecho.repository.BookmarkRepository;
import com.app.loveecho.repository.StoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final StoryRepository storyRepository;
    private final NotificationService notificationService;
    private final StoryService storyService; // ✅ Injected properly

    /* =========================
       TOGGLE BOOKMARK
    ========================== */
    public boolean toggleBookmark(String storyId, String username) {

        // Ensure story exists
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        return bookmarkRepository
                .findByUserIdAndStoryId(username, storyId)
                .map(existing -> {
                    // ❌ Unbookmark → no notification
                    bookmarkRepository.delete(existing);
                    return false;
                })
                .orElseGet(() -> {
                    // ✅ Bookmark
                    bookmarkRepository.save(
                            Bookmark.builder()
                                    .userId(username)
                                    .storyId(storyId)
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    );

                    // 🔔 Notify story owner
                    notificationService.notifyUser(
                            story.getUserId(),     // receiver
                            username,              // sender
                            story.getId(),
                            NotificationType.BOOKMARK
                    );

                    return true;
                });
    }

    /* =========================
       GET MY BOOKMARKED STORIES
    ========================== */
    public List<StoryResponseDTO> getMyBookmarks(String username) {

        return bookmarkRepository
                .findByUserIdOrderByCreatedAtDesc(username)
                .stream()
                // fetch story safely
                .map(bookmark ->
                        storyRepository.findById(bookmark.getStoryId()).orElse(null)
                )
                .filter(Objects::nonNull)
                .map(storyService::mapStoryToDTO)
                .toList();
    }
}
