package com.HopeHaven.util;

import java.util.List;

public class EmotionalMetricsUtil {

    public static double emotionalStability(List<Integer> scores) {
        if (scores.size() < 2) return 50;

        double mean = scores.stream().mapToInt(i -> i).average().orElse(0);
        double variance = scores.stream()
                .mapToDouble(s -> Math.pow(s - mean, 2))
                .average()
                .orElse(0);

        double stdDev = Math.sqrt(variance);

        return clamp(100 - (stdDev / 2.5) * 100);
    }

    public static double positivityRatio(long positive, long total) {
        if (total == 0) return 0;
        return clamp((double) positive / total * 100);
    }

    public static double negativeLoad(long negative, long total) {
        if (total == 0) return 0;
        return clamp((double) negative / total * 100);
    }

    public static double reflectionScore(long journals, long activeDays) {
        if (activeDays == 0) return 0;
        return clamp(Math.min(1.0, (double) journals / activeDays) * 100);
    }

    public static double consistencyScore(long activeDays, long totalDays) {
        if (totalDays == 0) return 0;
        return clamp((double) activeDays / totalDays * 100);
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, Math.round(v * 10.0) / 10.0));
    }
}
