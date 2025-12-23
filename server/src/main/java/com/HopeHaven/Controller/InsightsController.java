package com.HopeHaven.controller;

import com.HopeHaven.dto.GenerateInsightsRequest;
import com.HopeHaven.service.InsightsService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.ServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
public class InsightsController {

    @Autowired
    private InsightsService insightsService;
    @PostMapping("/generate")
    public ResponseEntity<?> generateInsights(
            @RequestBody GenerateInsightsRequest requestBody,
            ServletRequest request
    ) {
        try {
            FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
            String userId = user.getUid();

            String insights = insightsService.generateFromClient(userId, requestBody);
            return ResponseEntity.ok(insights);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("AI Insights failed: " + e.getMessage());
        }
    }
}
