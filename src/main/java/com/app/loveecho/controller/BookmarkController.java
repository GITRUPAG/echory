package com.app.loveecho.controller;

import com.app.loveecho.dto.StoryResponseDTO;
import com.app.loveecho.service.BookmarkService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    /* =========================
       TOGGLE BOOKMARK
    ========================== */
    @PostMapping("/{storyId}")
    public ResponseEntity<Map<String, Boolean>> toggleBookmark(
            @PathVariable String storyId,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();

        boolean bookmarked =
                bookmarkService.toggleBookmark(storyId, username);

        return ResponseEntity.ok(
                Map.of("bookmarked", bookmarked)
        );
    }

    /* =========================
       GET MY BOOKMARKS
    ========================== */
    @GetMapping("/me")
    public ResponseEntity<List<StoryResponseDTO>> getMyBookmarks(
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();

        return ResponseEntity.ok(
                bookmarkService.getMyBookmarks(username)
        );
    }
}
