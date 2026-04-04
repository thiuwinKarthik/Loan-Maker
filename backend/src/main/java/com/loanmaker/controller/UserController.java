package com.loanmaker.controller;

import com.loanmaker.model.User;
import com.loanmaker.service.UserService;
import com.loanmaker.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
// ✅ Remove @CrossOrigin("*") - it conflicts with our CORS config
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // ✅ User registration
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ✅ Admin registration
    @PostMapping("/register-admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public User registerAdmin(@RequestBody User user) {
        return userService.registerAdmin(user);
    }

    // ✅ Get all users (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ✅ Get logged-in user profile based on JWT token
    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getUserProfile() {
        // Get the logged-in user's email from authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Find user from DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return full user info
        return ResponseEntity.ok(user);
    }

    // ✅ Update logged-in user profile
    @PutMapping("/profile")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> updateUserProfile(@RequestBody User updatedUser) {
        // Get logged-in user's email from JWT authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Fetch user from database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields
        if (updatedUser.getName() != null) {
            user.setName(updatedUser.getName());
        }
        if (updatedUser.getPhone() != null) {
            user.setPhone(updatedUser.getPhone());
        }

        // Save updated user
        User savedUser = userRepository.save(user);

        // Return updated user (excluding password if needed)
        savedUser.setPassword(null); // optional: hide password
        return ResponseEntity.ok(savedUser);
    }

    // ✅ Admin-only test endpoint
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminStats() {
        long totalUsers = userRepository.count();
        long totalAdmins = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole().equalsIgnoreCase("ROLE_ADMIN"))
                .count();
        long totalNormalUsers = totalUsers - totalAdmins;

        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("totalUsers", totalUsers);
                put("totalAdmins", totalAdmins);
                put("totalNormalUsers", totalNormalUsers);
            }
        });
    }

}