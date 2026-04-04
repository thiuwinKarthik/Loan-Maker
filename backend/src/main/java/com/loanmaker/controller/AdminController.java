package com.loanmaker.controller;

import com.loanmaker.model.User;
import com.loanmaker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Promote user to admin
    @PutMapping("/users/promote/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> promoteUser(@PathVariable Long userId) {
        userService.promoteToAdmin(userId);
        return ResponseEntity.ok(Map.of("message", "User promoted to admin"));
    }

    // Optional: demote admin back to user
    @PutMapping("/users/demote/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> demoteUser(@PathVariable Long userId) {
        userService.demoteToUser(userId);
        return ResponseEntity.ok(Map.of("message", "Admin demoted to user"));
    }
}
