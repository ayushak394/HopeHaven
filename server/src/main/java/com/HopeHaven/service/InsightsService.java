package com.HopeHaven.service;

import com.HopeHaven.dto.GenerateInsightsRequest;
import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.MoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InsightsService {

    @Autowired
    private MoodRepository moodRepo;

    @Autowired
    private GeminiService gemini;

    // ⭐ Called by the controller — FINAL method
    public String generateFromClient(String userId, GenerateInsightsRequest req) throws Exception {

        // Date range
        LocalDateTime from = req.getFromDate() != null
                ? LocalDateTime.parse(req.getFromDate(), DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now().minusDays(7);

        LocalDateTime to = req.getToDate() != null
                ? LocalDateTime.parse(req.getToDate(), DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now();

        // Get moods from DB for last 7 days
        List<MoodEntry> moods = moodRepo.findLast7Days(userId, from);

        // Journals come in PLAINTEXT directly from the frontend now
        List<String> plaintextJournals = req.getJournals();

        String prompt = buildPrompt(moods, plaintextJournals);

        return gemini.generateInsight(prompt);
    }

    private String buildPrompt(List<MoodEntry> moods, List<String> journals) {

    String moodText;
    if (moods == null || moods.isEmpty()) {
        moodText = "No mood logs available.";
    } else {
        moodText = moods.stream()
                .limit(10)
                .map(m ->
                        m.getMood() + " on " + m.getTimestamp().toLocalDate()
                )
                .reduce("", (a, b) -> a + "- " + b + "\n");
    }

    String journalText;
    if (journals == null || journals.isEmpty()) {
        journalText = "No journal entries available.";
    } else {
        journalText = journals.stream()
                .limit(3)
                .map(j -> j.length() > 250 ? j.substring(0, 250) + "..." : j)
                .reduce("", (a, b) -> a + "- " + b + "\n");
    }

    return """
    You are an emotional wellness assistant.

    Using the data below, generate concise, empathetic insights.
    Avoid disclaimers like "insufficient data" unless absolutely necessary.
    Do NOT repeat the raw data back to the user.

    Respond in EXACTLY four sections, clearly labeled:

    1. Emotional Summary (3–4 sentences max)
    2. Patterns & Trends (bullet points, max 3)
    3. Wellness Suggestions (bullet points, max 3)
    4. One Short Motivational Message (1 sentence)

    Keep the tone warm, supportive, and human.
    Be insightful, not verbose.

    Mood Logs:
    %s

    Journal Excerpts:
    %s
    """
    .formatted(moodText, journalText);
}

}
