package com.app.loveecho.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.app.loveecho.dto.NotificationResponseDTO;
import com.app.loveecho.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /* =========================
       GET NOTIFICATIONS
    ========================== */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotifications(
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                notificationService.getNotificationsDTO(authentication.getName())
        );
    }

    /* =========================
       MARK AS READ
    ========================== */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /* =========================
       UNREAD COUNT
    ========================== */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                notificationService.getUnreadCount(authentication.getName())
        );
    }
}
