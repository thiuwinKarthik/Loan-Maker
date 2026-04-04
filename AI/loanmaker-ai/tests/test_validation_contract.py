from pydantic import ValidationError

from main import LoanRequest


def test_rejects_invalid_credit_score():
    try:
        LoanRequest(
            age=30,
            income=120000,
            existing_emi=12000,
            credit_score=1200,
            asset_value=500000,
            loan_amount=300000,
            tenure=36,
        )
        assert False, "Expected validation error"
    except ValidationError:
        assert True
