package com.loanmaker.service;

import com.loanmaker.model.User;
import com.loanmaker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole("USER");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User registerAdmin(User user) {
        user.setRole("ROLE_ADMIN");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    // Promote a user to admin
    public User promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if ("ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("User is already an admin");
        }
        user.setRole("ROLE_ADMIN");
        return userRepository.save(user);
    }

    // Optional: demote admin back to user
    public User demoteToUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if ("USER".equals(user.getRole())) {
            throw new RuntimeException("User is already a regular user");
        }
        user.setRole("USER");
        return userRepository.save(user);
    }
}