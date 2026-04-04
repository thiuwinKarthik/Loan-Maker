package com.loanmaker.repository;

import com.loanmaker.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    // Fetch loans by asset type (Gold, Land, Vehicle, etc.)
    List<Loan> findByLoanType(String loanType);
}
