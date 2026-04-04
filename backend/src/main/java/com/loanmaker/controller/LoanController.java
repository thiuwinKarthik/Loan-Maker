package com.loanmaker.controller;

import com.loanmaker.dto.LoanApplicationDTO;
import com.loanmaker.application.loan.ApplyLoanUseCase;
import com.loanmaker.model.*;
import com.loanmaker.repository.*;
import com.loanmaker.service.LoanService;
import com.loanmaker.service.UserLoanService;
import com.loanmaker.shared.audit.AuditLogger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private UserLoanService userLoanService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private LoanProviderRepository providerRepository;

    @Autowired
    private ApplyLoanUseCase applyLoanUseCase;

    @Autowired
    private AuditLogger auditLogger;

    // Get providers by loan type
    @GetMapping("/providers/{loanType}")
    public List<LoanProvider> getProviders(@PathVariable String loanType) {
        return loanService.getProvidersByLoanType(loanType);
    }

    @PutMapping("/admin/{loanId}/auto")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> autoEvaluateLoan(@PathVariable Long loanId) {
        // Get the loan application
        LoanApplication loan = loanService.getLoanById(loanId);

        // Evaluate loan using AI rules
        String status = loanService.evaluateLoan(loan);

        // Update status in database
        loan.setStatus(status);
        loanService.saveLoan(loan);

        auditLogger.logEvent("LOAN_AUTO_EVALUATED", null, java.util.Map.of("loanId", loanId, "status", status));
        return ResponseEntity.ok("Loan automatically " + status + "!");
    }

    // Apply loan (auto AI evaluation)
    @PostMapping("/apply/{userId}/{providerId}/{assetId}")
    public LoanApplicationDTO applyLoan(
            @PathVariable Long userId,
            @PathVariable Long providerId,
            @PathVariable Long assetId,
            @RequestBody LoanApplication loanApplication) {
        LoanApplication savedLoan = applyLoanUseCase.execute(userId, providerId, assetId, loanApplication);
        User user = savedLoan.getUser();
        LoanProvider provider = savedLoan.getProvider();
        Asset asset = savedLoan.getAsset();
        auditLogger.logEvent("LOAN_APPLIED", user.getEmail(), java.util.Map.of("loanId", savedLoan.getId()));

        return new LoanApplicationDTO(
                savedLoan.getId(),
                user.getId(),
                provider.getId(),
                provider.getBankName(),
                asset.getId(),
                asset.getAssetType(),
                savedLoan.getLoanAmount(),
                savedLoan.getTenure(),
                savedLoan.getStatus());
    }

    // Get loans for user
    @GetMapping("/applications/{userId}")
    public List<LoanApplicationDTO> getUserLoans(@PathVariable Long userId) {
        List<LoanApplication> apps = loanService.getUserLoans(userId);
        return apps.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Admin: get all loans
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<LoanApplicationDTO> getAllLoans() {
        return loanService.getAllLoans().stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Admin: get pending loans
    @GetMapping("/admin/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getPendingLoans() {
        return ResponseEntity.ok(loanService.getPendingLoans());
    }

    // Admin: approve loan
    @PutMapping("/admin/{loanId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveLoan(@PathVariable Long loanId) {
        loanService.approveLoan(loanId);
        return ResponseEntity.ok("Loan approved successfully!");
    }

    // Admin: reject loan
    @PutMapping("/admin/{loanId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> rejectLoan(@PathVariable Long loanId) {
        loanService.rejectLoan(loanId);
        return ResponseEntity.ok("Loan rejected successfully!");
    }

    // Admin: loan statistics
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getLoanStats() {
        List<LoanApplication> all = loanService.getAllLoans();
        long total = all.size();
        long approved = all.stream().filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus())).count();
        long pending = all.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
        long rejected = all.stream().filter(l -> "REJECTED".equalsIgnoreCase(l.getStatus())).count();

        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("totalLoans", total);
                put("approvedLoans", approved);
                put("pendingLoans", pending);
                put("rejectedLoans", rejected);
            }
        });
    }

    // Helper: convert LoanApplication to DTO
    private LoanApplicationDTO toDTO(LoanApplication app) {
        return new LoanApplicationDTO(
                app.getId(),
                app.getUser().getId(),
                app.getProvider().getId(),
                app.getProvider().getBankName(),
                app.getAsset().getId(),
                app.getAsset().getAssetType(),
                app.getLoanAmount(),
                app.getTenure(),
                app.getStatus());
    }
}
