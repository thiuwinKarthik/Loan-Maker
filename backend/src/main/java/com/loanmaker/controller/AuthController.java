package com.loanmaker.controller;

import com.loanmaker.model.User;
import com.loanmaker.repository.UserRepository;
import com.loanmaker.security.JwtUtil;
import com.loanmaker.shared.audit.AuditLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogger auditLogger;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid credentials");
        }

        // Unwrap Optional properly
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        auditLogger.logEvent("USER_LOGIN", user.getEmail(), Map.of("role", user.getRole()));
        return Map.of("token", token);
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String phone = request.get("phone");
        String role = request.getOrDefault("role", "USER");

        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(role);

        userRepository.save(user);

        // Generate JWT token after registration
        String token = jwtUtil.generateToken(user.getEmail());

        auditLogger.logEvent("USER_REGISTERED", user.getEmail(), Map.of("role", user.getRole()));
        return Map.of(
                "message", "Registration successful!",
                "token", token,
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "role", user.getRole());
    }
}
