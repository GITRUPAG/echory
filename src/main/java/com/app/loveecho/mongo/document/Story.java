package com.app.loveecho.mongo.document;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import com.app.loveecho.jpa.entity.StoryCategory;
import com.app.loveecho.jpa.entity.Visibility;

import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    private Boolean anonymous = false;

    @Builder.Default
private List<String> imageUrls = new ArrayList<>();


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
