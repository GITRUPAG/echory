package com.app.loveecho.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.app.loveecho.model.StoryCategory;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;


@Document(collection = "stories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {

    @Id
    private String id;

    private String userId; // reference to MySQL User id



    private String title;
    private String content;

    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    private List<Reaction> reactions = new ArrayList<>();

    @Builder.Default
    private List<String> hashtags = new ArrayList<>();
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
private StoryCategory category = StoryCategory.GENERAL;


}
