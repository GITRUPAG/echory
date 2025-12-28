package com.app.loveecho.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryResponseDTO {
    private String id;
    private String title;
    private String content;
    private String visibility;
    private String category;
    private String userId;
    private LocalDateTime createdAt;
    private UserMiniDTO user;
    private List<CommentResponseDTO> comments;
    private int reactionsCount;
}