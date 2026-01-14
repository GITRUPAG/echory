package com.app.loveecho.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.app.loveecho.mongo.document.Story;
import com.app.loveecho.mongo.document.UserPreference;
import com.app.loveecho.mongo.repository.UserPreferenceRepository;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository repo;

    public void recordInteraction(String username, Story story) {

        UserPreference pref = repo.findByUserId(username)
                .orElse(UserPreference.builder()
                        .userId(username)
                        .build());

        // Category boost
        pref.getCategoryScores()
                .merge(story.getCategory().name(), 2, Integer::sum);

        // Hashtag boost
        if (story.getHashtags() != null) {
            story.getHashtags().forEach(tag ->
                pref.getHashtagScores().merge(tag, 1, Integer::sum)
            );
        }

        // Author boost
        pref.getAuthorScores()
                .merge(story.getUserId(), 1, Integer::sum);

        repo.save(pref);
    }

    public UserPreference getPreferences(String username) {
        return repo.findByUserId(username).orElse(null);
    }
}