import pandas as pd

def recommend_lenders(user_data):
    """
    user_data = {
        "age": 30,
        "income": 40000,
        "existing_emi": 2000,
        "credit_score": 720,
        "asset_value": 800000,
        "loan_amount": 300000,
        "tenure": 36
    }
    """
    lenders = pd.read_csv("dataset/lenders.csv")
    eligible_lenders = []

    for _, lender in lenders.iterrows():
        if (lender.min_loan <= user_data["loan_amount"] <= lender.max_loan and
            user_data["credit_score"] >= lender.min_credit_score):
            eligible_lenders.append({
                "lender": lender.lender_name,
                "interest_rate": lender.interest_rate
            })

    # Sort by lowest interest rate
    eligible_lenders = sorted(eligible_lenders, key=lambda x: x["interest_rate"])
    return eligible_lenders
