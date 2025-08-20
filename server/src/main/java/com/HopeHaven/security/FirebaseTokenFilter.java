package com.HopeHaven.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.HopeHaven.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

@Component
public class FirebaseTokenFilter implements Filter {

     private final UserService userService;

    @Autowired
    public FirebaseTokenFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String header = httpRequest.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                
                userService.saveOrGetUser(
                        decodedToken.getUid(),
                        decodedToken.getName(),
                        decodedToken.getEmail()
                );
                
                request.setAttribute("firebaseUser", decodedToken);
            } catch (Exception e) {
                throw new ServletException("Invalid Firebase ID token", e);
            }
        } else {
            throw new ServletException("Missing Authorization header");
        }

        chain.doFilter(request, response);
    }
}
