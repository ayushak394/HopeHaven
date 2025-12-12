package com.HopeHaven.dto;

public class EncryptedJournalView {
    private Long id;
    private String userId;
    private String cipherText;
    private String iv;
    private String createdAt;

    public EncryptedJournalView(Long id, String userId, String cipherText, String iv, String createdAt) {
        this.id = id; this.userId = userId; this.cipherText = cipherText; this.iv = iv; this.createdAt = createdAt;
    }
    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getCipherText() { return cipherText; }
    public String getIv() { return iv; }
    public String getCreatedAt() { return createdAt; }
}
