package com.HopeHaven.controller;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.ServletRequest;

@RestController
public class SecureController {

    @GetMapping("/api/secure-data")
    public String getSecureData(ServletRequest request) {
        FirebaseToken user = (FirebaseToken) request.getAttribute("firebaseUser");
        return "Hello " + user.getEmail() + "! You are authenticated ✅";
    }
}
