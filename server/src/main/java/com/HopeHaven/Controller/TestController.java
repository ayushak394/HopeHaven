package com.HopeHaven.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController; // ✅ ADD THIS

@RestController
public class TestController {

    @GetMapping("/")
    public String test() {
        return "Backend running 🚀";
    }
}