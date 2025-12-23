package com.HopeHaven.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;



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

   
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();


    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public String getCipherText() { return cipherText; }
public void setCipherText(String cipherText) { this.cipherText = cipherText; }

public String getIv() { return iv; }
public void setIv(String iv) { this.iv = iv; }

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

}
