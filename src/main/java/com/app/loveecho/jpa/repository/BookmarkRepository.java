package com.app.loveecho.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.loveecho.jpa.entity.Bookmark;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Optional<Bookmark> findByUserIdAndStoryId(String userId, String storyId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserIdAndStoryId(String userId, String storyId);
}
