// package com.HopeHaven.controller;

// import com.HopeHaven.model.JournalEntry;
// import com.HopeHaven.repository.JournalRepository;
// import com.google.firebase.auth.FirebaseToken;
// import jakarta.servlet.ServletRequest;

// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// import com.HopeHaven.dto.EncryptedJournalDto;
// import com.HopeHaven.dto.EncryptedJournalView;
// import java.time.format.DateTimeFormatter;
// import java.util.stream.Collectors;

// @RestController
// @RequestMapping("/api/journal")
// public class JournalController {

//     private final JournalRepository journalRepository;

//     public JournalController(JournalRepository journalRepository) {
//         this.journalRepository = journalRepository;
//     }

//     // ⭐ Add Journal Entry
//     @PostMapping("/add")
//     public JournalEntry addJournal(@RequestBody JournalEntry requestEntry, ServletRequest request) {
//         FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

//         JournalEntry entry = new JournalEntry();
//         entry.setContent(requestEntry.getContent());
//         entry.setUserId(user.getUid());

//         return journalRepository.save(entry);
//     }

//     // ⭐ Get all journal entries for user
//     @GetMapping("/all")
//     public List<JournalEntry> getEntries(ServletRequest request) {
//         FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
//         return journalRepository.findByUserIdOrderByCreatedAtDesc(user.getUid());
//     }

//     // ⭐ Delete entry
//     @DeleteMapping("/{id}")
//     public void deleteEntry(@PathVariable Long id, ServletRequest request) {
//         FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

//         JournalEntry entry = journalRepository.findById(id).orElse(null);
//         if (entry != null && entry.getUserId().equals(user.getUid())) {
//             journalRepository.delete(entry);
//         }
//     }
// }

package com.HopeHaven.controller;

import com.HopeHaven.model.JournalEntry;
import com.HopeHaven.repository.JournalRepository;

import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.ServletRequest;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.HopeHaven.dto.EncryptedJournalDto;
import com.HopeHaven.dto.EncryptedJournalView;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalRepository journalRepository;

    public JournalController(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    // ⭐ Add plaintext journal entry (old endpoint)
    @PostMapping("/add")
    public JournalEntry addJournal(@RequestBody JournalEntry requestEntry, ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

        JournalEntry entry = new JournalEntry();
        entry.setContent(requestEntry.getContent());
        entry.setUserId(user.getUid());

        return journalRepository.save(entry);
    }

    // ⭐ Get all plaintext entries (old endpoint)
    @GetMapping("/all")
    public List<JournalEntry> getEntries(ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        return journalRepository.findByUserIdOrderByCreatedAtDesc(user.getUid());
    }

    // ⭐ Delete entry
    @DeleteMapping("/{id}")
    public void deleteEntry(@PathVariable Long id, ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

        JournalEntry entry = journalRepository.findById(id).orElse(null);
        if (entry != null && entry.getUserId().equals(user.getUid())) {
            journalRepository.delete(entry);
        }
    }

    // ⭐ NEW: Add encrypted entry (correct path)
    @PostMapping("/add-encrypted")
    public JournalEntry addEncrypted(@RequestBody EncryptedJournalDto dto, ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");

        JournalEntry entry = new JournalEntry();
        entry.setUserId(user.getUid());
        entry.setCipherText(dto.getCipherText());
        entry.setIv(dto.getIv());

        return journalRepository.save(entry);
    }

    // ⭐ NEW: Get encrypted entries (correct path)
    @GetMapping("/all-encrypted")
    public List<EncryptedJournalView> getEncrypted(ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        return journalRepository.findByUserIdOrderByCreatedAtDesc(user.getUid())
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
}
