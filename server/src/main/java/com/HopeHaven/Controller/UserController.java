// package com.HopeHaven.controller;

// import com.HopeHaven.model.User;
// import com.HopeHaven.repository.UserRepository;
// import com.google.firebase.auth.FirebaseToken;
// import jakarta.servlet.ServletRequest;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/user")
// public class UserController {

//     @Autowired
//     private UserRepository userRepo;

//     @PutMapping("/update-name")
//     public User updateName(@RequestBody UpdateNameRequest request, ServletRequest servletRequest) {

//         FirebaseToken firebaseUser = (FirebaseToken) servletRequest.getAttribute("firebaseUser");
//         String uid = firebaseUser.getUid();

//         User user = userRepo.findById(uid).orElse(null);
//         if (user == null) throw new RuntimeException("User not found");

//         user.setName(request.getNewName());
//         return userRepo.save(user);
//     }

//     static class UpdateNameRequest {
//         private String newName;

//         public String getNewName() { return newName; }
//         public void setNewName(String newName) { this.newName = newName; }
//     }

//     @GetMapping("/profile")
// public User getProfile(ServletRequest request) {
//     FirebaseToken firebaseUser = (FirebaseToken) request.getAttribute("firebaseUser");
//     String uid = firebaseUser.getUid();

//     return userRepo.findById(uid).orElse(null);
// }

//     @PutMapping("/update-avatar")
//     public User updateAvatar(@RequestBody AvatarRequest req, ServletRequest request) {
//         FirebaseToken firebaseUser = (FirebaseToken) request.getAttribute("firebaseUser");
//         String uid = firebaseUser.getUid();

//         User user = userRepo.findById(uid).orElseThrow();
//         user.setAvatarUrl(req.getAvatarUrl());

//         return userRepo.save(user);
//     }
// }


// class AvatarRequest {
//     private String avatarUrl;

//     public String getAvatarUrl() { return avatarUrl; }
//     public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
// }
// }

package com.HopeHaven.controller;

import com.HopeHaven.model.User;
import com.HopeHaven.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.ServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    // GET PROFILE
    @GetMapping("/profile")
    public User getProfile(ServletRequest request) {
        FirebaseToken firebaseUser = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = firebaseUser.getUid();
        return userRepo.findById(uid).orElse(null);
    }

    // UPDATE NAME
    @PutMapping("/update-name")
    public User updateName(@RequestBody UpdateNameRequest request, ServletRequest servletRequest) {
        FirebaseToken firebaseUser = (FirebaseToken) servletRequest.getAttribute("firebaseUser");
        String uid = firebaseUser.getUid();

        User user = userRepo.findById(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getNewName());
        return userRepo.save(user);
    }

    static class UpdateNameRequest {
        private String newName;
        public String getNewName() { return newName; }
        public void setNewName(String newName) { this.newName = newName; }
    }

    // UPDATE AVATAR
    @PutMapping("/update-avatar")
    public User updateAvatar(@RequestBody AvatarRequest req, ServletRequest request) {
        FirebaseToken firebaseUser = (FirebaseToken) request.getAttribute("firebaseUser");
        String uid = firebaseUser.getUid();

        User user = userRepo.findById(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAvatarUrl(req.getAvatarUrl());
        return userRepo.save(user);
    }

    static class AvatarRequest {
        private String avatarUrl;
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
