import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "loan_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "services")
MODEL_PATH = os.path.join(MODEL_DIR, "loan_model.pkl")

def train_loan_model():
    # Load dataset
    df = pd.read_csv(DATASET_PATH)

    # Features & target
    X = df.drop("approved", axis=1)
    y = df["approved"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate accuracy
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Loan Eligibility Model Trained! Accuracy: {acc:.2f}")

    # Save model in app/services for FastAPI to use
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"📁 Model saved at: {MODEL_PATH}")

if __name__ == "__main__":
    train_loan_model()
