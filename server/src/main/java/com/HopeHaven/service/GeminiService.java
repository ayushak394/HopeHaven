package com.HopeHaven.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final HttpClient client = HttpClient.newHttpClient();

    public String generateInsight(String prompt) throws Exception {

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
        """.formatted(prompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
 + apiKey
))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        String body = response.body();

// If Gemini returns an error JSON, return a helpful message
if (body.contains("\"error\"")) {
    return "Our AI service is currently unavailable due to API limits. Please try again later.";
}

return body;
    }
}
