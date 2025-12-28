package com.app.loveecho.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    private String userId; // MySQL User id
    private String type; // LIKE, LOVE, WOW, etc.
    private LocalDateTime createdAt;
}
