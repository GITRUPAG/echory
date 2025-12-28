package com.app.loveecho.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserMiniDTO {
    private Long id;
    private String username;
    private String profileImageUrl;
}