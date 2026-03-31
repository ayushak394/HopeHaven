package com.HopeHaven.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.*;

@Service
public class GeminiService {

    @Value("${GEMINI_KEY}")
    private String apiKey;

    private final HttpClient client = HttpClient.newHttpClient();

    public Map<String, String> generateInsight(String prompt) throws Exception {

        String safePrompt = prompt
            .replace("\"", "\\\"")
            .replace("\n", "\\n");

        String json = """
        {
          "contents": [
            {
              "parts": [
                { "text": "%s" }
              ]
            }
          ]
        }
        """.formatted(safePrompt);

        HttpRequest request = HttpRequest.newBuilder()
               .uri(new URI(
                  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + apiKey
                ))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String body = response.body();

        if (body.contains("\"error\"")) {
            System.err.println("Gemini Error: " + body);
            return Map.of("summary", "AI service is temporarily unavailable. Please try again later.");
        }

        try {
            String rawText = extractText(body);
            
            String cleanText = rawText.replaceAll("[#*]", "").trim();

            String[] parts = cleanText.split("\\[SPLIT\\]");

            Map<String, String> sectionMap = new LinkedHashMap<>();
            sectionMap.put("summary",    parts.length > 0 ? parts[0].trim() : "No summary available.");
            sectionMap.put("patterns",   parts.length > 1 ? parts[1].trim() : "No patterns detected.");
            sectionMap.put("wellness",   parts.length > 2 ? parts[2].trim() : "No suggestions today.");
            sectionMap.put("motivation", parts.length > 3 ? parts[3].trim() : "Keep going!");

            return sectionMap;

        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + body);
            return Map.of("summary", "AI was unable to create insights at this time.");
        }
    }

    private String extractText(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode textNode = root
            .path("candidates")
            .path(0)
            .path("content")
            .path("parts")
            .path(0)
            .path("text");

        if (textNode.isMissingNode()) {
            throw new RuntimeException("No text in Gemini response");
        }

        return textNode.asText();
    }
}