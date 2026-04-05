package com.loanmaker.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import com.loanmaker.infrastructure.web.CorrelationIdFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtFilter jwtFilter;
    private final CorrelationIdFilter correlationIdFilter;

    public SecurityConfig(UserDetailsServiceImpl uds, JwtFilter jwtFilter, CorrelationIdFilter correlationIdFilter) {
        this.userDetailsService = uds;
        this.jwtFilter = jwtFilter;
        this.correlationIdFilter = correlationIdFilter;
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Add CORS configuration source
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "https://timely-tanuki-loan-maker.netlify.app" , "https://loan-maker.vercel.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ Enable CORS
                .headers(headers -> headers
                        .xssProtection(Customizer.withDefaults())
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                        .frameOptions(frame -> frame.deny())
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // User registration
                        .requestMatchers("/api/users/register").permitAll()
                        .requestMatchers("/api/users/register-admin").hasAuthority("ROLE_ADMIN")
                        // User management - FIXED URL PATTERN
                        .requestMatchers("/api/users/all").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/users/profile").hasAnyAuthority("USER", "ROLE_ADMIN")
                        .requestMatchers("/api/rag/**").hasAnyAuthority("USER", "ROLE_ADMIN")
                        // AI microservice endpoint
                        .requestMatchers("/api/ai/**").authenticated()
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                // JWT filter
                .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}