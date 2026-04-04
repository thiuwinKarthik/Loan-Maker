# services/train_loan_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load your large dataset
df = pd.read_csv("dataset/loan_data_large.csv")

X = df[["age", "income", "existing_emi", "credit_score", "asset_value", "loan_amount", "tenure"]]
y = df["approved"]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
with open("services/loan_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved as services/loan_model.pkl")
