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

    String firebaseConfig = System.getenv("FIREBASE_CONFIG");

    if (firebaseConfig == null) {
        throw new RuntimeException("❌ FIREBASE_CONFIG not set in environment");
    }

    InputStream serviceAccount =
            new java.io.ByteArrayInputStream(firebaseConfig.getBytes());

    FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();

    if (FirebaseApp.getApps().isEmpty()) {
        FirebaseApp.initializeApp(options);
        System.out.println("✅ Firebase initialized via ENV");
    }
}
}