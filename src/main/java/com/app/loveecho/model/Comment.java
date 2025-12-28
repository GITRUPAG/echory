package com.app.loveecho.model;

import java.time.LocalDateTime;
import java.util.ArrayList;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    private String id;
    private String userId; // MySQL User id
    private String text;
    private LocalDateTime createdAt;

    private List<String> likedBy = new ArrayList<>();
}
