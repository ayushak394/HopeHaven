package com.HopeHaven.util;

public class MoodScoreUtil {

    public static int score(String mood) {
        return switch (mood.toLowerCase()) {
            case "happy" -> 5;
            case "calm" -> 4;
            case "neutral" -> 3;
            case "sad" -> 2;
            case "anxious", "angry" -> 1;
            default -> 3;
        };
    }
}
