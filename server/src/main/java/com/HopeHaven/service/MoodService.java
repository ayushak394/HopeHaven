package com.HopeHaven.service;

import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.MoodRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MoodService {
    private final MoodRepository repo;

    public MoodService(MoodRepository repo) {
        this.repo = repo;
    }

    public MoodEntry saveMood(String userId, String mood) {
        MoodEntry entry = new MoodEntry(userId, mood, LocalDateTime.now());
        return repo.save(entry);
    }

    public List<MoodEntry> getUserMoods(String userId) {
        return repo.findByUserIdOrderByTimestampDesc(userId);
    }
}
