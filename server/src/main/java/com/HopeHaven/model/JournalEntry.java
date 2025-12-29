package com.HopeHaven.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;



@Entity
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String content;

    @Column(columnDefinition = "LONGTEXT")
private String cipherText;   

@Column(length = 64)
private String iv;           

   
    @Column(nullable = false)
private Instant createdAt = Instant.now();


    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }

    public String getCipherText() { return cipherText; }
public void setCipherText(String cipherText) { this.cipherText = cipherText; }

public String getIv() { return iv; }
public void setIv(String iv) { this.iv = iv; }

public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
}

}
