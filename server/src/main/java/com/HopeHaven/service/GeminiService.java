package com.HopeHaven.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final HttpClient client = HttpClient.newHttpClient();

    public String generateInsight(String prompt) throws Exception {

        // Escape quotes to avoid invalid JSON
        String safePrompt = prompt.replace("\"", "\\\"");

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

        // If error returned by Gemini
        if (body.contains("\"error\"")) {
            System.out.println("Gemini Error: " + body);
            return "AI service is temporarily unavailable. Please try again later.";
        }
        

        // Try extracting text inside the response
        try {
            return extractText(body);
        } catch (Exception e) {
            System.out.println("Failed to parse Gemini response: " + body);
            return "AI was unable to create insights at this time.";
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
