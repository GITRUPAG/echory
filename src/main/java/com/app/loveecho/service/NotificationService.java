package com.app.loveecho.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.loveecho.dto.NotificationResponseDTO;
import com.app.loveecho.jpa.entity.NotificationType;
import com.app.loveecho.mongo.document.Notification;
import com.app.loveecho.mongo.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /* =========================
       CREATE NOTIFICATION
    ========================== */
    public void notifyUser(
            String receiver,
            String sender,
            String storyId,
            NotificationType type
    ) {
        // ❌ Do not notify yourself
        if (receiver.equals(sender)) return;

        Notification notification = Notification.builder()
                .receiverId(receiver)
                .senderId(sender)
                .storyId(storyId)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    /* =========================
       GET NOTIFICATIONS
    ========================== */
    public List<Notification> getNotifications(String username) {
        return notificationRepository
                .findByReceiverIdOrderByCreatedAtDesc(username);
    }

    /* =========================
       MARK AS READ
    ========================== */
    public void markAsRead(String notificationId, String username) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Safety check
        if (!notification.getReceiverId().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /* =========================
       UNREAD COUNT
    ========================== */
    public long getUnreadCount(String username) {
            return notificationRepository.countByReceiverIdAndReadFalse(username);
        }

        public List<NotificationResponseDTO> getNotificationsDTO(String username) {

        return notificationRepository
                .findByReceiverIdOrderByCreatedAtDesc(username)
                .stream()
                .map(notification -> NotificationResponseDTO.builder()
                        .id(notification.getId())
                        .senderId(notification.getSenderId())
                        .storyId(notification.getStoryId())
                        .type(notification.getType().name())
                        .read(notification.isRead())
                        .createdAt(notification.getCreatedAt())
                        .build())
                .toList();
    }
}
