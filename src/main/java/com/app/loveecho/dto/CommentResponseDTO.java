package com.app.loveecho.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentResponseDTO {
    private String id;
    private String text;
    private LocalDateTime createdAt;
    private String userId;
    private String username;
    private String profileImageUrl;
}
