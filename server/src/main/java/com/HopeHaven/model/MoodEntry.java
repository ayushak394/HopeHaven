package com.HopeHaven.model;

import jakarta.persistence.*;
import java.time.Instant;

import java.time.LocalDateTime;

@Entity
@Table(name = "mood_entries")
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;  
    private String mood;     
@Column(nullable = false)
    private Instant timestamp = Instant.now();

    public MoodEntry() {}

    public MoodEntry(String userId, String mood, LocalDateTime timestamp) {
        this.userId = userId;
        this.mood = mood;
        this.timestamp = Instant.now();

    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getMood() { return mood; }
    public Instant getTimestamp() {
        return timestamp;
    }

    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setMood(String mood) { this.mood = mood; }
    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
 }
}
