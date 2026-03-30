package com.HopeHaven.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.InputStream;  
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() throws IOException {

    InputStream serviceAccount = getClass()
        .getClassLoader()
        .getResourceAsStream("firebase-service-account.json");

if (serviceAccount == null) {
    System.out.println("⚠️ Firebase config not found, skipping initialization");
    return;
}

FirebaseOptions options = FirebaseOptions.builder()
        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
        .build();

if (FirebaseApp.getApps().isEmpty()) {
    FirebaseApp.initializeApp(options);
}
}