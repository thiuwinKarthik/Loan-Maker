package com.loanmaker.application.loan;

import com.loanmaker.model.Asset;
import com.loanmaker.model.LoanApplication;
import com.loanmaker.model.LoanProvider;
import com.loanmaker.model.User;
import com.loanmaker.repository.AssetRepository;
import com.loanmaker.repository.LoanProviderRepository;
import com.loanmaker.repository.UserRepository;
import com.loanmaker.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplyLoanUseCase {
    private final LoanService loanService;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final LoanProviderRepository loanProviderRepository;

    @Transactional
    public LoanApplication execute(Long userId, Long providerId, Long assetId, LoanApplication loanApplication) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        LoanProvider provider = loanProviderRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        loanApplication.setUser(user);
        loanApplication.setProvider(provider);
        loanApplication.setAsset(asset);
        return loanService.applyLoan(loanApplication);
    }
}
