package com.loanmaker.repository;

import com.loanmaker.model.LoanProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanProviderRepository extends JpaRepository<LoanProvider, Long> {

    // Fetch providers by loan type (e.g., Gold, Land)
    List<LoanProvider> findByLoanType(String loanType);
}
