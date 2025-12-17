package com.HopeHaven.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String uid;  // Firebase UID
    private String name;
    private String email;
private String avatarUrl;
  private boolean journalLockEnabled = false;
    private String journalPasscodeHash;

    public User() {}

    public User(String uid, String name, String email) {
        this.uid = uid;
        this.name = name;
        this.email = email;
    }

    // Getters & Setters
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatarUrl() { return avatarUrl; }
public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

public boolean isJournalLockEnabled() {
        return journalLockEnabled;
    }

    public void setJournalLockEnabled(boolean journalLockEnabled) {
        this.journalLockEnabled = journalLockEnabled;
    }

    public String getJournalPasscodeHash() {
        return journalPasscodeHash;
    }

    public void setJournalPasscodeHash(String journalPasscodeHash) {
        this.journalPasscodeHash = journalPasscodeHash;
    }
}
