// package com.HopeHaven.service;

// import com.HopeHaven.model.MoodEntry;
// import com.HopeHaven.model.JournalEntry;
// import com.HopeHaven.repository.MoodRepository;
// import com.HopeHaven.repository.JournalRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;
// import java.util.List;

// @Service
// public class InsightsService {

//     @Autowired
//     private MoodRepository moodRepo;

//     @Autowired
//     private JournalRepository journalRepo;

//     @Autowired
//     private GeminiService gemini;


//     public String generateInsights(String userId) throws Exception {

//         LocalDateTime fromDate = LocalDateTime.now().minusDays(7);

//         List<MoodEntry> moods = moodRepo.findLast7Days(userId, fromDate);
//         List<JournalEntry> journals = journalRepo.findLast7Days(userId, fromDate);

//         String prompt = buildPrompt(moods, journals);

//         return gemini.generateInsight(prompt);
//     }

//     private String buildPrompt(List<MoodEntry> moods, List<JournalEntry> journals) {

//         return """
//         Analyze the following mood logs and journal entries for the user.

//         Provide:
//         1. A simple emotional summary of the past week.
//         2. Patterns or trends you notice.
//         3. Personalized wellness suggestions for next week.
//         4. One positive motivational message.

//         Mood Logs:
//         %s

//         Journal Entries:
//         %s
//         """.formatted(moods, journals);
//     }
// }

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

        return """
        Analyze the following user data for emotional insights.

        Provide:
        1. Emotional summary for the week.
        2. Patterns or behavioral trends.
        3. Personalized wellness suggestions.
        4. One short motivational message.

        Mood Logs:
        %s

        Journal Entries (plaintext decrypted):
        %s
        """
                .formatted(moods.toString(), journals.toString());
    }
}
