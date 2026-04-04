package com.loanmaker.controller;

import com.loanmaker.model.LoanApplication;
import com.loanmaker.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminLoanController {

    @Autowired
    private LoanService loanService;

    // ✅ Get all pending loans
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<LoanApplication>> getPendingLoans() {
        return ResponseEntity.ok(loanService.getPendingLoans());
    }

    // ✅ Approve loan
    @PutMapping("/{loanId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> approveLoan(@PathVariable Long loanId) {
        loanService.approveLoan(loanId);
        return ResponseEntity.ok("Loan approved successfully!");
    }

    // ✅ Reject loan
    @PutMapping("/{loanId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> rejectLoan(@PathVariable Long loanId) {
        loanService.rejectLoan(loanId);
        return ResponseEntity.ok("Loan rejected successfully!");
    }
}
