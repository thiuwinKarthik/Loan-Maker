import pandas as pd
import numpy as np
import os

# Number of records
num_records = 1000

# Generate random data
np.random.seed(42)
data = {
    "age": np.random.randint(21, 60, num_records),
    "income": np.random.randint(15000, 100000, num_records),
    "existing_emi": np.random.randint(0, 15000, num_records),
    "credit_score": np.random.randint(300, 850, num_records),
    "asset_value": np.random.randint(50000, 1000000, num_records),
    "loan_amount": np.random.randint(5000, 500000, num_records),
    "tenure": np.random.choice([12, 24, 36, 48, 60], num_records)
}

# Simple rule for loan approval (for training)
# 1 = approved, 0 = rejected
approval = []
for i in range(num_records):
    score = 0
    if data["income"][i] > 25000: score += 1
    if data["credit_score"][i] > 650: score += 1
    if data["existing_emi"][i] < data["income"][i]*0.4: score += 1
    if data["asset_value"][i] > data["loan_amount"][i]*1.2: score += 1
    approval.append(1 if score >= 3 else 0)

data["approved"] = approval

# Create DataFrame
df = pd.DataFrame(data)

# Create dataset folder if it doesn't exist
dataset_dir = os.path.join(os.path.dirname(__file__), "../dataset")
if not os.path.exists(dataset_dir):
    os.makedirs(dataset_dir)

# Save to CSV
csv_path = os.path.join(dataset_dir, "loan_data_large.csv")
df.to_csv(csv_path, index=False)

print(f"Large dataset generated: {csv_path}")
