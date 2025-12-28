package com.app.loveecho.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Table(
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "story_id"}
    )
)
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId; // username

    @Column(name = "story_id", nullable = false)
    private String storyId;

    private LocalDateTime createdAt;
}
