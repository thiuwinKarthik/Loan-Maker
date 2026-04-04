package com.loanmaker.service;

import com.loanmaker.model.Asset;
import com.loanmaker.model.LoanApplication;
import com.loanmaker.model.LoanProvider;
import com.loanmaker.model.User;
import com.loanmaker.domain.loan.LoanEvaluationPolicy;
import com.loanmaker.repository.AssetRepository;
import com.loanmaker.repository.LoanApplicationRepository;
import com.loanmaker.repository.LoanProviderRepository;
import com.loanmaker.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private LoanProviderRepository loanProviderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private LoanEvaluationPolicy loanEvaluationPolicy;

    // Get all loan providers by type
    public List<LoanProvider> getProvidersByLoanType(String loanType) {
        return loanProviderRepository.findByLoanType(loanType);
    }

    // Apply loan with AI evaluation
    public LoanApplication applyLoan(LoanApplication loanApplication) {
        String status = evaluateLoan(loanApplication); // Auto-approve/reject
        loanApplication.setStatus(status);
        return loanApplicationRepository.save(loanApplication);
    }

    // Evaluate loan automatically (AI simulation)
    public String evaluateLoan(LoanApplication loanApplication) {
        User user = loanApplication.getUser();
        Asset asset = loanApplication.getAsset();
        double loanAmount = loanApplication.getLoanAmount();
        return loanEvaluationPolicy.evaluate(user, asset, loanAmount).name();
    }

    public List<LoanApplication> getAllLoans() {
        return loanApplicationRepository.findAll();
    }

    public LoanApplication getLoanById(Long loanId) {
        return loanApplicationRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    public LoanApplication saveLoan(LoanApplication loan) {
        return loanApplicationRepository.save(loan);
    }

    public List<LoanApplication> getUserLoans(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return loanApplicationRepository.findByUser(user);
    }

    public List<LoanApplication> getPendingLoans() {
        return loanApplicationRepository.findByStatus("PENDING");
    }

    public LoanApplication approveLoan(Long loanId) {
        LoanApplication loan = getLoanById(loanId);
        loan.setStatus("APPROVED");
        return loanApplicationRepository.save(loan);
    }

    public LoanApplication rejectLoan(Long loanId) {
        LoanApplication loan = getLoanById(loanId);
        loan.setStatus("REJECTED");
        return loanApplicationRepository.save(loan);
    }
}
