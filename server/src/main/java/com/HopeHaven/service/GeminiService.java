// package com.HopeHaven.service;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;

// import java.net.URI;
// import java.net.http.HttpClient;
// import java.net.http.HttpRequest;
// import java.net.http.HttpResponse;

// @Service
// public class GeminiService {

//     @Value("${gemini.api.key}")
//     private String apiKey;

//     private final HttpClient client = HttpClient.newHttpClient();

//     public String generateInsight(String prompt) throws Exception {

//         String json = """
//         {
//           "contents": [
//             {
//               "parts": [
//                 { "text": "%s" }
//               ]
//             }
//           ]
//         }
//         """.formatted(prompt);

//         HttpRequest request = HttpRequest.newBuilder()
//                 .uri(URI.create(
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
//  + apiKey
// ))
//                 .header("Content-Type", "application/json")
//                 .POST(HttpRequest.BodyPublishers.ofString(json))
//                 .build();

//         HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

//         String body = response.body();

// // If Gemini returns an error JSON, return a helpful message
// if (body.contains("\"error\"")) {
//     return "Our AI service is currently unavailable due to API limits. Please try again later.";
// }

// return body;
//     }
// }

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
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey
                ))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String body = response.body();

        // If error returned by Gemini
        if (body.contains("\"error\"")) {
            System.out.println("Gemini Error: " + body);
            return "Our AI service hit a rate or quota limit. Please try again in a minute.";
        }

        // Try extracting text inside the response
        try {
            return extractText(body);
        } catch (Exception e) {
            System.out.println("Failed to parse Gemini response: " + body);
            return "AI was unable to create insights at this time.";
        }
    }

    // Extracts candidates[0].content.parts[0].text
    private String extractText(String json) {
        // Very simple extraction (avoids needing a full JSON parser)
        int idx = json.indexOf("\"text\":");
        if (idx == -1) return json;

        int start = json.indexOf("\"", idx + 7) + 1;
        int end = json.indexOf("\"", start);

        return json.substring(start, end)
                .replace("\\n", "\n")
                .replace("\\\"", "\"");
    }
}
