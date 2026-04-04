package com.loanmaker.domain.loan;

import com.loanmaker.model.Asset;
import com.loanmaker.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LoanEvaluationPolicyTest {

    private final LoanEvaluationPolicy policy = new LoanEvaluationPolicy();

    @Test
    void shouldApproveWhenCreditStrongAndLoanCoveredByAsset() {
        User user = new User();
        user.setCreditScore(760);
        user.setPreviousLoans(1);
        Asset asset = new Asset();
        asset.setValue(2_000_000.0);

        LoanDecision decision = policy.evaluate(user, asset, 1_500_000.0);
        assertEquals(LoanDecision.APPROVED, decision);
    }

    @Test
    void shouldRejectWhenCreditVeryLow() {
        User user = new User();
        user.setCreditScore(420);
        user.setPreviousLoans(1);
        Asset asset = new Asset();
        asset.setValue(2_000_000.0);

        LoanDecision decision = policy.evaluate(user, asset, 500_000.0);
        assertEquals(LoanDecision.REJECTED, decision);
    }
}
