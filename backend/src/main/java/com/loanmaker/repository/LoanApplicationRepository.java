package com.loanmaker.repository;

import com.loanmaker.model.LoanApplication;
import com.loanmaker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    /**
     * Fetch all loans for a specific user
     */
    List<LoanApplication> findByUser(User user);

    /**
     * Fetch all loans for a user using userId directly
     */
    List<LoanApplication> findByUserId(Long userId);

    /**
     * Fetch loans by status (PENDING, APPROVED, REJECTED)
     */
    List<LoanApplication> findByStatus(String status);

    /**
     * Fetch loans for a specific user filtered by status
     * Example: Get all approved loans for a given user
     */
    List<LoanApplication> findByUserAndStatus(User user, String status);
}
