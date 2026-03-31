package com.HopeHaven.controller;

import com.HopeHaven.model.*;
import com.HopeHaven.repository.*;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.ServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class HomeController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MoodRepository moodRepository;

    @Autowired
    private JournalRepository journalRepository;

    @GetMapping("/home")
    public Map<String, Object> getHomeData(ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = user.getUid();

        User dbUser = userRepo.findById(uid).orElse(null);

        List<MoodEntry> moods = moodRepository.findByUserIdOrderByTimestampDesc(uid);
        List<JournalEntry> journals = journalRepository.findByUserIdOrderByCreatedAtDesc(uid);

        int streak = calculateStreak(moods, journals);
        int weeklyCompletion = calculateWeeklyCompletion(moods);

        Map<String, Object> map = new HashMap<>();

        map.put("name", dbUser.getName());
        map.put("email", dbUser.getEmail());
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