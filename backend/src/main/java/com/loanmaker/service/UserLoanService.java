package com.loanmaker.service;

import com.loanmaker.model.Asset;
import com.loanmaker.model.Loan;
import com.loanmaker.repository.AssetRepository;
import com.loanmaker.repository.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserLoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private AssetRepository assetRepository;

    /**
     * ✅ Fetch loan offers & eligibility based on user's assets
     */
    public Map<String, Object> getUserLoanOffers(Long userId) {
        Map<String, Object> response = new HashMap<>();

        // Fetch user's assets
        List<Asset> assets = assetRepository.findByUserId(userId);

        if (assets.isEmpty()) {
            response.put("userId", userId);
            response.put("eligibleAmount", 0);
            response.put("offers", Collections.emptyList());
            response.put("message", "No assets found for this user");
            return response;
        }

        double eligibleAmount = 0;
        List<Loan> offers = new ArrayList<>();

        for (Asset asset : assets) {
            // Fetch loans related to this asset type
            List<Loan> assetLoans = loanRepository.findByLoanType(asset.getAssetType());

            if (assetLoans != null && !assetLoans.isEmpty()) {
                offers.addAll(assetLoans);
            }

            // Simple eligibility formula → AI logic will come later
            eligibleAmount += asset.getValue() * 0.7; // 70% of asset value
        }

        // Prepare response
        response.put("userId", userId);
        response.put("eligibleAmount", eligibleAmount);
        response.put("offers", offers);
        response.put("totalAssets", assets.size());
        response.put("message", "Loan offers fetched successfully");

        return response;
    }
}
