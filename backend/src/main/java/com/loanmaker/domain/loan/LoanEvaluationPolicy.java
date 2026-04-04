package com.loanmaker.domain.loan;

import com.loanmaker.model.Asset;
import com.loanmaker.model.User;
import org.springframework.stereotype.Component;

@Component
public class LoanEvaluationPolicy {

    public LoanDecision evaluate(User user, Asset asset, double loanAmount) {
        int previousLoans = user.getPreviousLoans();
        int creditScore = user.getCreditScore();
        double assetValue = asset.getAssetValue();

        if (creditScore >= 700 && previousLoans <= 2 && loanAmount <= assetValue) {
            return LoanDecision.APPROVED;
        }
        if (creditScore < 500 || loanAmount > assetValue * 1.2) {
            return LoanDecision.REJECTED;
        }
        return LoanDecision.PENDING;
    }
}
