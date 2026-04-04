package com.loanmaker.repository;

import com.loanmaker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Return Optional so we can safely use orElseThrow
    Optional<User> findByEmail(String email);
}
