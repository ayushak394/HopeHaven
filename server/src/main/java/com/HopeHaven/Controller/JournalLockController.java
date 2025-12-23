package com.HopeHaven.controller;

import com.HopeHaven.model.User;
import com.HopeHaven.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.ServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/journal-lock")
public class JournalLockController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/status")
    public Map<String, Boolean> getLockStatus(ServletRequest request) {

        FirebaseToken firebaseUser = 
                (FirebaseToken) request.getAttribute("firebaseUser");

        User user = userRepo.findById(firebaseUser.getUid())
                .orElseThrow();

        return Map.of("enabled", user.isJournalLockEnabled());
    }

    @PostMapping("/enable")
    public Map<String, String> enableLock(
            @RequestBody PasscodeRequest req,
            ServletRequest request
    ) {
        FirebaseToken firebaseUser =
                (FirebaseToken) request.getAttribute("firebaseUser");

        User user = userRepo.findById(firebaseUser.getUid())
                .orElseThrow();

        if (req.getPasscode() == null || req.getPasscode().length() < 4) {
            throw new RuntimeException("Passcode must be at least 4 characters");
        }

        user.setJournalLockEnabled(true);
        user.setJournalPasscodeHash(passwordEncoder.encode(req.getPasscode()));

        userRepo.save(user);

        return Map.of("status", "enabled");
    }

    @PostMapping("/verify")
    public Map<String, Boolean> verifyPasscode(
            @RequestBody PasscodeRequest req,
            ServletRequest request
    ) {

        FirebaseToken firebaseUser =
                (FirebaseToken) request.getAttribute("firebaseUser");

        User user = userRepo.findById(firebaseUser.getUid())
                .orElseThrow();

        if (!user.isJournalLockEnabled() || user.getJournalPasscodeHash() == null) {
            return Map.of("success", false);
        }

        boolean match = passwordEncoder.matches(
                req.getPasscode(),
                user.getJournalPasscodeHash()
        );

        return Map.of("success", match);
    }

    @PostMapping("/disable")
    public Map<String, String> disableLock(ServletRequest request) {

        FirebaseToken firebaseUser =
                (FirebaseToken) request.getAttribute("firebaseUser");

        User user = userRepo.findById(firebaseUser.getUid())
                .orElseThrow();

        user.setJournalLockEnabled(false);
        user.setJournalPasscodeHash(null);

        userRepo.save(user);

        return Map.of("status", "disabled");
    }

    @PostMapping("/change")
    public Map<String, String> changePasscode(
            @RequestBody ChangePasscodeRequest req,
            ServletRequest request
    ) {
        FirebaseToken firebaseUser = 
                (FirebaseToken) request.getAttribute("firebaseUser");

        User user = userRepo.findById(firebaseUser.getUid())
                .orElseThrow();

        if (!passwordEncoder.matches(req.getOldPasscode(), user.getJournalPasscodeHash())) {
            throw new RuntimeException("Incorrect old passcode");
        }

        if (req.getNewPasscode() == null || req.getNewPasscode().length() < 4) {
            throw new RuntimeException("New passcode must be at least 4 characters");
        }

        user.setJournalPasscodeHash(passwordEncoder.encode(req.getNewPasscode()));
        userRepo.save(user);

        return Map.of("status", "passcode_changed");
    }

    static class PasscodeRequest {
        private String passcode;
        public String getPasscode() { return passcode; }
        public void setPasscode(String passcode) { this.passcode = passcode; }
    }

    static class ChangePasscodeRequest {
        private String oldPasscode;
        private String newPasscode;

        public String getOldPasscode() { return oldPasscode; }
        public void setOldPasscode(String oldPasscode) { this.oldPasscode = oldPasscode; }

        public String getNewPasscode() { return newPasscode; }
        public void setNewPasscode(String newPasscode) { this.newPasscode = newPasscode; }
    }
}
