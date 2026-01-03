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
import java.time.ZoneId;


@RestController
public class HomepageSummaryController {

    private final MoodRepository moodRepository;
    private final JournalRepository journalRepository;

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

        int streak = calculateStreak(moods, journals);
        int weeklyCompletion = calculateWeeklyCompletion(moods);

        Map<String, Object> map = new HashMap<>();
        map.put("totalMoods", moods.size());
        map.put("totalJournals", journals.size());
        map.put("streak", streak);
        map.put("weeklyCompletion", weeklyCompletion);

        return map;
    }

    private int calculateStreak(
        List<MoodEntry> moods,
        List<JournalEntry> journals
) {
    if (moods.isEmpty() && journals.isEmpty()) return 0;

    // Collect all active dates (mood OR journal)
    Set<LocalDate> activeDates = new HashSet<>();

    moods.forEach(m ->
        activeDates.add(
            m.getTimestamp()
             .atZone(ZoneId.systemDefault())
             .toLocalDate()
        )
    );

    journals.forEach(j ->
        activeDates.add(
            j.getCreatedAt()
             .atZone(ZoneId.systemDefault())
             .toLocalDate()
        )
    );

    // Start from the most recent active day
    LocalDate today = LocalDate.now();
    LocalDate cursor = activeDates.contains(today)
            ? today
            : today.minusDays(1);

    int streak = 0;

    while (activeDates.contains(cursor)) {
        streak++;
        cursor = cursor.minusDays(1);
    }

    return streak;
}

    private int calculateWeeklyCompletion(List<MoodEntry> moods) {
    LocalDate today = LocalDate.now();
    LocalDate monday = today.with(DayOfWeek.MONDAY);

    long daysLogged = moods.stream()
            .map(m -> m.getTimestamp()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate())
            .filter(date -> !date.isBefore(monday))
            .distinct()
            .count();

    return (int) ((daysLogged / 7.0) * 100);
}

}
