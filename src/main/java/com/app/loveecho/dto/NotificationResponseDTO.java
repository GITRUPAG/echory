package com.app.loveecho.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private String id;
    private String senderId;
    private String storyId;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;
}
