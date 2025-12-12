package com.HopeHaven.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mood_entries")
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;   // Firebase UID
    private String mood;     // happy, sad, etc.
    private LocalDateTime timestamp;

    public MoodEntry() {}

    public MoodEntry(String userId, String mood, LocalDateTime timestamp) {
        this.userId = userId;
        this.mood = mood;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getMood() { return mood; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setMood(String mood) { this.mood = mood; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
