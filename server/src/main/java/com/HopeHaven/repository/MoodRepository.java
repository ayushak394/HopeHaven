package com.HopeHaven.repository;

import com.HopeHaven.model.MoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MoodRepository extends JpaRepository<MoodEntry, Long> {

    List<MoodEntry> findByUserIdOrderByTimestampDesc(String userId);

    @Query("SELECT m FROM MoodEntry m WHERE m.userId = :userId AND m.timestamp >= :fromDate ORDER BY m.timestamp DESC")
    List<MoodEntry> findLast7Days(
            @Param("userId") String userId,
            @Param("fromDate") LocalDateTime fromDate
    );
}
