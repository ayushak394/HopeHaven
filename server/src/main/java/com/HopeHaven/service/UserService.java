package com.HopeHaven.service;

import com.HopeHaven.model.User;
import com.HopeHaven.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User saveOrGetUser(String uid, String name, String email) {
        return userRepository.findById(uid).orElseGet(() -> {
            User newUser = new User(uid, name, email);
            return userRepository.save(newUser);
        });
    }
}
