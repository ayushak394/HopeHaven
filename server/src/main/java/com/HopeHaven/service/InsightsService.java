package com.HopeHaven.service;

import com.HopeHaven.dto.GenerateInsightsRequest;
import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.repository.MoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class InsightsService {

    @Autowired
    private MoodRepository moodRepo;

    @Autowired
    private GeminiService gemini;

    public Map<String, String> generateFromClient(String userId, GenerateInsightsRequest req) throws Exception {

        Instant from;
        try {
            String raw = req.getFromDate();
            if (raw != null) {
                if (!raw.endsWith("Z")) raw = raw + "Z";
                from = Instant.parse(raw);
            } else {
                from = Instant.now().minus(7, ChronoUnit.DAYS);
            }
        } catch (Exception e) {
            from = Instant.now().minus(7, ChronoUnit.DAYS);
        }

        Instant to;
        try {
            String raw = req.getToDate();
            if (raw != null) {
                if (!raw.endsWith("Z")) raw = raw + "Z";
                to = Instant.parse(raw);
            } else {
                to = Instant.now();
            }
        } catch (Exception e) {
            to = Instant.now();
        }

        List<MoodEntry> moods = moodRepo.findLast7Days(userId, from);
        List<String> plaintextJournals = req.getJournals();

        if (plaintextJournals == null || plaintextJournals.isEmpty()) {
            return Map.of("summary", "Start journaling to unlock AI insights ✨");
        }

        String prompt = buildPrompt(moods, plaintextJournals);

        return gemini.generateInsight(prompt);
    }

    private String buildPrompt(List<MoodEntry> moods, List<String> journals) {
    String moodText = (moods == null || moods.isEmpty()) ? "No mood logs provided for this period." :
            moods.stream().limit(14).map(m -> "Mood: " + m.getMood() + " | Date: " + 
            m.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate())
            .collect(Collectors.joining("\n", "", ""));

    String journalText = (journals == null || journals.isEmpty()) ? "No journal entries provided." :
            journals.stream().limit(5).map(j -> j.length() > 500 ? j.substring(0, 500) + "..." : j)
            .collect(Collectors.joining("\n---\n", "Entries:\n", ""));

    return """
    ROLE: 
    You are the HopeHaven Intelligence, an expert compassionate emotional wellness coach specializing in Cognitive Behavioral Therapy (CBT) and Mindfulness. 
    Your goal is to provide deep, non-judgmental insights based on a user's mood logs and journal entries.

    DATA FOR ANALYSIS:
    ---
    MOOD HISTORY (Past few days):
    %s

    JOURNAL ENTRIES:
    %s
    ---

    TASK:
    Analyze the emotional vocabulary, recurring themes, and the relationship between events and mood.
    
    RESPONSE ARCHITECTURE (CRITICAL):
    1. Respond in EXACTLY four sections.
    2. Separate sections ONLY with the tag [SPLIT].
    3. DO NOT use Markdown formatting (no #, no **, no *, no lists).
    4. Use plain text only.

    SECTION GUIDELINES:
    Section 1: Emotional Summary
    Provide a holistic view of their current state. Instead of just saying "you feel sad," identify the nuance (e.g., "pervasive fatigue," "guarded optimism," or "situational anxiety"). Acknowledge their resilience.

    Section 2: Patterns and Trends
    Identify one or two specific triggers or positive correlations. (Example: "You notice a significant mood lift on days you mention social connection" or "Negative self-talk appears most frequently in late-evening entries").

    Section 3: Wellness Suggestions
    Provide 2-3 actionable, small "Micro-steps." Do not give generic advice like "be happy." Suggest specific CBT techniques like 'Three Good Things' or 'Thought Reframing' based on their specific journal content.

    Section 4: Motivational Message
    A single, powerful, high-impact sentence that validates their journey. No clichés.

    SAFETY GUARDRAIL:
    If the user expresses immediate self-harm or crisis, prioritize a gentle suggestion to seek professional human support alongside your insight.
    """.formatted(moodText, journalText);
}
}