package com.app.loveecho.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private String receiverId; // username (who gets notification)
    private String senderId;   // username (who triggered it)

    private String storyId;

    private NotificationType type; // LIKE, COMMENT, BOOKMARK

    private boolean read;

    private LocalDateTime createdAt;
}
