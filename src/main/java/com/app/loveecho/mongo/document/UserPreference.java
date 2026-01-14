package com.app.loveecho.mongo.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    private String id;

    private String userId;

    @Builder.Default
    private Map<String, Integer> categoryScores = new HashMap<>();

    @Builder.Default
    private Map<String, Integer> hashtagScores = new HashMap<>();

    @Builder.Default
    private Map<String, Integer> authorScores = new HashMap<>();
}
