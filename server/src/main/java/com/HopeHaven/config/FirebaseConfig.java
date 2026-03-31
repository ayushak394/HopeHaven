package com.HopeHaven.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.io.IOException;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() throws IOException {

        String base64Config = System.getenv("FIREBASE_CONFIG_BASE64");

        if (base64Config == null) {
            throw new RuntimeException("❌ FIREBASE_CONFIG_BASE64 not set in environment");
        }

        byte[] decodedBytes = Base64.getDecoder().decode(base64Config);

        

        InputStream serviceAccount =
                new java.io.ByteArrayInputStream(decodedBytes);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized via BASE64 ENV");
        }
    }
}