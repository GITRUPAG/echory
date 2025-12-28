package com.app.loveecho.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String username;
    private String email;
    private String password; // optional
}
