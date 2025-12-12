
// package com.HopeHaven.controller;

// import com.HopeHaven.service.InsightsService;
// import com.google.firebase.auth.FirebaseToken;
// import jakarta.servlet.ServletRequest;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/insights")
// public class InsightsController {

//     @Autowired
//     private InsightsService insightsService;

//     @GetMapping
//     public ResponseEntity<?> getInsights(ServletRequest request) {
//         try {
//             FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
//             String email = user.getEmail();

//             // ✅ FIXED — use InsightsService, not GeminiService directly
//             String insights = insightsService.generateInsights(email);

//             return ResponseEntity.ok(insights);

//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.status(500).body("AI Insights error: " + e.getMessage());
//         }
//     }

//     @PostMapping("/generate")
//     public ResponseEntity<?> generateInsights(@RequestBody GenerateInsightsRequest body, ServletRequest request) {
//         try {
//             FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
//             String uid = user.getUid();

//             String insights = insightsService.generateFromClient(uid, body);
//             return ResponseEntity.ok(insights);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.status(500).body("AI Insights error: " + e.getMessage());
//         }
//     }
// }


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

    // ⭐ Frontend sends:
    // journals: [plaintext decrypted]
    // fromDate: "2025-12-01T00:00:00"
    // toDate: "2025-12-11T23:59:59"
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
