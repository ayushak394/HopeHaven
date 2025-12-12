package com.HopeHaven.repository;

import com.HopeHaven.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT j FROM JournalEntry j WHERE j.userId = :userId AND j.createdAt >= :fromDate ORDER BY j.createdAt DESC")
    List<JournalEntry> findLast7Days(
            @Param("userId") String userId,
            @Param("fromDate") LocalDateTime fromDate
    );
}
