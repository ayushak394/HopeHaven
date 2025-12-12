package com.HopeHaven.controller;

import com.HopeHaven.model.JournalEntry;
import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.JournalRepository;
import com.HopeHaven.repository.MoodRepository;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.ServletRequest;

import java.util.*;

@RestController
public class DashboardController {

    private final MoodRepository moodRepository;
    private final JournalRepository journalRepository;

    // ✅ Manual constructor for Spring autowiring (fixes your error)
    public DashboardController(MoodRepository moodRepository, JournalRepository journalRepository) {
        this.moodRepository = moodRepository;
        this.journalRepository = journalRepository;
    }

    @GetMapping("/api/dashboard")
    public Map<String, Object> getDashboardData(ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = user.getUid();

        List<MoodEntry> moods = moodRepository.findByUserIdOrderByTimestampDesc(uid);
        List<JournalEntry> journals = journalRepository.findByUserIdOrderByCreatedAtDesc(uid);

        // Mood score mapping
        Map<String, Integer> moodScale = Map.of(
                "Happy", 5,
                "Calm", 4,
                "Neutral", 3,
                "Sad", 2,
                "Anxious", 1
        );

        double avgMood = moods.stream()
                .mapToInt(m -> moodScale.getOrDefault(m.getMood(), 3))
                .average()
                .orElse(0);

        // Placeholder sentiment
        double avgSentiment = journals.size() * 0.2;

        // Achievements
        List<String> achievements = new ArrayList<>();
        if (moods.size() >= 7) achievements.add("1 Week Mood Tracking Streak");
        if (journals.size() >= 10) achievements.add("10 Journal Entries Written");
        if (avgMood >= 4) achievements.add("Positive Mood Consistency");

        Map<String, Object> response = new HashMap<>();
        response.put("averageMood", avgMood);
        response.put("totalMoods", moods.size());
        response.put("averageSentiment", avgSentiment);
        response.put("totalJournals", journals.size());
        response.put("achievements", achievements);

        return response;
    }
}
