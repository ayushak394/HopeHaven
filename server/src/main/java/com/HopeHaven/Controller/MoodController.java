package com.HopeHaven.controller;

import com.HopeHaven.model.MoodEntry;
import com.HopeHaven.service.MoodService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.ServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/moods")
@CrossOrigin(origins = "http://localhost:3000")
public class MoodController {

    private final MoodService moodService;

    public MoodController(MoodService moodService) {
        this.moodService = moodService;
    }

    @PostMapping("/track")
    public MoodEntry saveMood(@RequestBody MoodRequest moodRequest, ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        return moodService.saveMood(user.getUid(), moodRequest.getMood());
    }

    @GetMapping("/all")
    public List<MoodEntry> getUserMoods(ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        return moodService.getUserMoods(user.getUid());
    }

    public static class MoodRequest {
        private String mood;

        public String getMood() { return mood; }
        public void setMood(String mood) { this.mood = mood; }
    }
}
