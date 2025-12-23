package com.HopeHaven.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import com.HopeHaven.dto.EncryptedJournalDto;
import com.HopeHaven.dto.EncryptedJournalView;
import com.HopeHaven.model.JournalEntry;
import com.HopeHaven.repository.JournalRepository;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.ServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalRepository journalRepository;

    public JournalController(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    @PostMapping("/add-encrypted")
    public JournalEntry addEncrypted(@RequestBody EncryptedJournalDto dto, ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

        JournalEntry entry = new JournalEntry();
        entry.setUserId(user.getUid());
        entry.setCipherText(dto.getCipherText());
        entry.setIv(dto.getIv());
        entry.setCreatedAt(LocalDateTime.now());

        return journalRepository.save(entry);
    }

    @GetMapping("/all-encrypted")
    public List<EncryptedJournalView> getEncrypted(ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        return journalRepository
                .findByUserIdAndCipherTextIsNotNullOrderByCreatedAtDesc(user.getUid())
                .stream()
                .map(e -> new EncryptedJournalView(
                        e.getId(),
                        e.getUserId(),
                        e.getCipherText(),
                        e.getIv(),
                        e.getCreatedAt() != null ? fmt.format(e.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());
    }

    @PutMapping("/update/{id}")
    public JournalEntry updateJournal(
            @PathVariable Long id,
            @RequestBody EncryptedJournalDto dto,
            ServletRequest request
    ) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = user.getUid();

        JournalEntry entry = journalRepository.findById(id).orElse(null);

        if (entry == null || !entry.getUserId().equals(uid)) {
            throw new RuntimeException("Unauthorized or not found");
        }

        entry.setCipherText(dto.getCipherText());
        entry.setIv(dto.getIv());

        return journalRepository.save(entry);
    }

    @DeleteMapping("/{id}")
    public void deleteEntry(@PathVariable Long id, ServletRequest request) {

        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

        JournalEntry entry = journalRepository.findById(id).orElse(null);

        if (entry != null && entry.getUserId().equals(user.getUid())) {
            journalRepository.delete(entry);
        }
    }
}
