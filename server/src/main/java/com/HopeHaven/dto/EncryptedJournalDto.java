package com.HopeHaven.dto;

public class EncryptedJournalDto {
    private String cipherText;
    private String iv;

    public String getCipherText() { return cipherText; }
    public void setCipherText(String cipherText) { this.cipherText = cipherText; }
    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }
}
