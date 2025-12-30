package com.HopeHaven.controller;

import com.HopeHaven.model.JournalEntry;
import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.JournalRepository;
import com.HopeHaven.repository.MoodRepository;
import com.HopeHaven.util.EmotionalMetricsUtil;
import com.HopeHaven.util.MoodScoreUtil;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.ServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.IsoFields;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import java.time.ZoneId;
import java.time.Instant;



@RestController
public class DashboardController {

    private final MoodRepository moodRepository;
    private final JournalRepository journalRepository;

    public DashboardController(
            MoodRepository moodRepository,
            JournalRepository journalRepository
    ) {
        this.moodRepository = moodRepository;
        this.journalRepository = journalRepository;
    }

    @GetMapping("/api/dashboard")
    public Map<String, Object> getDashboardData(ServletRequest request) {


        FirebaseToken firebaseUser =
                (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = firebaseUser.getUid();

        List<Object[]> moodRows = moodRepository.findMoodTimeline(uid);

        List<Integer> moodScores = new ArrayList<>();
        List<LocalDate> moodDates = new ArrayList<>();

        for (Object[] row : moodRows) {
    String mood = (String) row[0];
    Instant ts = (Instant) row[1];

    moodScores.add(MoodScoreUtil.score(mood));
    moodDates.add(
        ts.atZone(ZoneId.systemDefault()).toLocalDate()
    );
}


        List<Double> emaValues = new ArrayList<>();

        if (!moodScores.isEmpty()) {
            double alpha = 2.0 / (7 + 1);
            double ema = moodScores.get(0);
            emaValues.add(ema);

            for (int i = 1; i < moodScores.size(); i++) {
                ema = alpha * moodScores.get(i) + (1 - alpha) * ema;
                emaValues.add(ema);
            }
        }

        Map<Integer, List<Double>> weeklyEmaMap = new LinkedHashMap<>();

        for (int i = 0; i < moodDates.size(); i++) {
            int week = moodDates.get(i)
                    .get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);

            weeklyEmaMap
                    .computeIfAbsent(week, k -> new ArrayList<>())
                    .add(emaValues.get(i));
        }

        List<Map<String, Object>> moodTrend = new ArrayList<>();

        weeklyEmaMap.forEach((week, values) -> {
            double avg = values.stream()
                    .mapToDouble(v -> v)
                    .average()
                    .orElse(0);

            moodTrend.add(Map.of(
                    "label", "Week " + week,
                    "value", Math.round(avg * 10.0) / 10.0
            ));
        });

       
        List<MoodEntry> moods =
                moodRepository.findByUserIdOrderByTimestampDesc(uid);

        List<JournalEntry> journals =
                journalRepository.findByUserIdOrderByCreatedAtDesc(uid);

        
        List<Integer> scores = moods.stream()
                .map(m -> MoodScoreUtil.score(m.getMood()))
                .toList();

        long positiveCount = moods.stream()
                .filter(m ->
                        m.getMood().equals("happy") ||
                        m.getMood().equals("calm"))
                .count();

        long negativeCount = moods.stream()
                .filter(m ->
                        m.getMood().equals("sad") ||
                        m.getMood().equals("anxious") ||
                        m.getMood().equals("angry"))
                .count();

        Set<LocalDate> activeDays = moods.stream()
                .map(m -> m.getTimestamp()
        .atZone(ZoneId.systemDefault())
        .toLocalDate())
                .collect(Collectors.toSet());

        long totalDays = activeDays.isEmpty()
                ? 0
                : ChronoUnit.DAYS.between(
                        Collections.min(activeDays),
                        Collections.max(activeDays)
                ) + 1;

        List<Map<String, Object>> emotionalBalance = List.of(
                Map.of("category", "Stability",
                        "score", EmotionalMetricsUtil.emotionalStability(scores)),
                Map.of("category", "Positivity",
                        "score", EmotionalMetricsUtil.positivityRatio(positiveCount, moods.size())),
                Map.of("category", "Negative Load",
                        "score", EmotionalMetricsUtil.negativeLoad(negativeCount, moods.size())),
                Map.of("category", "Reflection",
                        "score", EmotionalMetricsUtil.reflectionScore(journals.size(), activeDays.size())),
                Map.of("category", "Consistency",
                        "score", EmotionalMetricsUtil.consistencyScore(activeDays.size(), totalDays))
        );

     
        Map<Integer, List<MoodEntry>> moodsByWeek = new HashMap<>();
        Map<Integer, List<JournalEntry>> journalsByWeek = new HashMap<>();

        WeekFields weekFields = WeekFields.ISO;

        for (MoodEntry m : moods) {
            int week = m.getTimestamp()
        .atZone(ZoneId.systemDefault())
        .get(weekFields.weekOfWeekBasedYear());

            moodsByWeek
                    .computeIfAbsent(week, k -> new ArrayList<>())
                    .add(m);
        }

        for (JournalEntry j : journals) {
            int week = j.getCreatedAt()
        .atZone(ZoneId.systemDefault())
        .get(weekFields.weekOfWeekBasedYear());

            journalsByWeek
                    .computeIfAbsent(week, k -> new ArrayList<>())
                    .add(j);
        }

        List<Map<String, Object>> engagementTrend = new ArrayList<>();

        Set<Integer> allWeeks = new HashSet<>();
        allWeeks.addAll(moodsByWeek.keySet());
        allWeeks.addAll(journalsByWeek.keySet());

        for (Integer week : allWeeks) {

            List<MoodEntry> weekMoods =
                    moodsByWeek.getOrDefault(week, List.of());

            List<JournalEntry> weekJournals =
                    journalsByWeek.getOrDefault(week, List.of());

            int activityCount = weekMoods.size() + weekJournals.size();
            double activityScore =
                    Math.min(activityCount / 10.0, 1.0) * 100;

            Set<LocalDate> weekActiveDays = weekMoods.stream()
                    .map(m -> m.getTimestamp()
        .atZone(ZoneId.systemDefault())
        .toLocalDate())
                    .collect(Collectors.toSet());

            double consistencyScore =
                    (weekActiveDays.size() / 7.0) * 100;

            double reflectionScore =
                    weekMoods.isEmpty()
                            ? 0
                            : Math.min(
                                    (double) weekJournals.size() / weekMoods.size(),
                                    1.0
                            ) * 100;

            double engagement = Math.min(
                    (0.4 * activityScore)
                  + (0.4 * consistencyScore)
                  + (0.2 * reflectionScore),
                    100
            );

            engagementTrend.add(Map.of(
                    "week", "Week " + week,
                    "engagement", Math.round(engagement)
            ));
        }

        engagementTrend.sort(
                Comparator.comparing(m ->
                        Integer.parseInt(
                                ((String) m.get("week"))
                                        .replace("Week ", "")
                        )
                )
        );

        double avgMood = moods.stream()
                .mapToInt(m -> MoodScoreUtil.score(m.getMood()))
                .average()
                .orElse(0);


double avgMoodScore = moods.stream()
        .mapToInt(m -> MoodScoreUtil.score(m.getMood()))
        .average()
        .orElse(3);

double normalizedMood = (avgMoodScore - 1) / 4.0;

double reflectionScore = activeDays.isEmpty()
        ? 0
        : Math.min((double) journals.size() / activeDays.size(), 1.0);

double avgSentiment =
        (0.7 * normalizedMood) +
        (0.3 * reflectionScore);

avgSentiment = Math.round(avgSentiment * 100.0) / 100.0;


        List<String> achievements = new ArrayList<>();
        if (moods.size() >= 7)
            achievements.add("1 Week Mood Tracking Streak");
        if (journals.size() >= 10)
            achievements.add("10 Journal Entries Written");
        if (avgMood >= 4)
            achievements.add("Positive Mood Consistency");

        Map<String, Object> response = new HashMap<>();
        response.put("averageMood", avgMood);
        response.put("totalMoods", moods.size());
        response.put("averageSentiment", avgSentiment);
        response.put("totalJournals", journals.size());
        response.put("achievements", achievements);
        response.put("moodTrend", moodTrend);
        response.put("emotionalBalance", emotionalBalance);
        response.put("engagementTrend", engagementTrend);
        response.put("moods", moods);
response.put("journals", journals);

        return response;
    }
}
