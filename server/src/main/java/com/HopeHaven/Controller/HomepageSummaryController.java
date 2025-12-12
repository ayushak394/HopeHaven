package com.HopeHaven.Controller;

import com.HopeHaven.model.JournalEntry;
import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.JournalRepository;
import com.HopeHaven.repository.MoodRepository;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.ServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class HomepageSummaryController {

    private final MoodRepository moodRepository;
    private final JournalRepository journalRepository;

    // 🔥 Manual constructor because Lombok is not working
    public HomepageSummaryController(MoodRepository moodRepository, JournalRepository journalRepository) {
        this.moodRepository = moodRepository;
        this.journalRepository = journalRepository;
    }

    @GetMapping("/api/dashboard/summary")
    public Map<String, Object> getSummary(ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = user.getUid();

        List<MoodEntry> moods = moodRepository.findByUserIdOrderByTimestampDesc(uid);
        List<JournalEntry> journals = journalRepository.findByUserIdOrderByCreatedAtDesc(uid);

        int streak = calculateStreak(moods);
        int weeklyCompletion = calculateWeeklyCompletion(moods);

        Map<String, Object> map = new HashMap<>();
        map.put("totalMoods", moods.size());
        map.put("totalJournals", journals.size());
        map.put("streak", streak);
        map.put("weeklyCompletion", weeklyCompletion);

        return map;
    }

    private int calculateStreak(List<MoodEntry> moods) {
        if (moods.isEmpty()) return 0;

        Set<LocalDate> dates = moods.stream()
                .map(m -> m.getTimestamp().toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate today = LocalDate.now();

        while (dates.contains(today.minusDays(streak))) {
            streak++;
        }
        return streak;
    }

    private int calculateWeeklyCompletion(List<MoodEntry> moods) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(DayOfWeek.MONDAY);

        long daysLogged = moods.stream()
                .map(m -> m.getTimestamp().toLocalDate())
                .filter(date -> !date.isBefore(monday))
                .distinct()
                .count();

        return (int) ((daysLogged / 7.0) * 100);
    }
}
