"""
Module 1: Train & compare Decision Tree vs Random Forest
Run with: python train_model.py
(Run this from inside backend/ml/, with your venv active)
"""
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# ---- 1. Load data ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
train_df = pd.read_csv(os.path.join(BASE_DIR, "dataset", "Training.csv"))
test_df = pd.read_csv(os.path.join(BASE_DIR, "dataset", "Testing.csv"))

# The Kaggle CSV sometimes has a stray "Unnamed: 133" empty column — drop it if present
train_df = train_df.loc[:, ~train_df.columns.str.contains("^Unnamed")]
test_df = test_df.loc[:, ~test_df.columns.str.contains("^Unnamed")]

print(f"Training data shape: {train_df.shape}")
print(f"Testing data shape: {test_df.shape}")
print(f"Number of diseases: {train_df['prognosis'].nunique()}")

# ---- 2. Split features (symptoms) and target (disease) ----
X_train = train_df.drop(columns=["prognosis"])
y_train = train_df["prognosis"]
X_test = test_df.drop(columns=["prognosis"])
y_test = test_df["prognosis"]

# Save the symptom column order — predict.py needs this to build input vectors correctly
symptom_columns = list(X_train.columns)

# ---- 3. Train Decision Tree ----
dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X_train, y_train)
dt_preds = dt_model.predict(X_test)
dt_accuracy = accuracy_score(y_test, dt_preds)
print(f"\nDecision Tree Accuracy: {dt_accuracy:.4f}")

# ---- 4. Train Random Forest ----
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
rf_preds = rf_model.predict(X_test)
rf_accuracy = accuracy_score(y_test, rf_preds)
print(f"Random Forest Accuracy: {rf_accuracy:.4f}")

# ---- 5. Save both models + the symptom column order ----
SAVE_DIR = os.path.join(BASE_DIR, "saved_models")
os.makedirs(SAVE_DIR, exist_ok=True)

joblib.dump(dt_model, os.path.join(SAVE_DIR, "decision_tree_model.pkl"))
joblib.dump(rf_model, os.path.join(SAVE_DIR, "random_forest_model.pkl"))
joblib.dump(symptom_columns, os.path.join(SAVE_DIR, "symptom_columns.pkl"))

# ---- 6. Save a small comparison report (you'll use this in Module 6 dashboard) ----
comparison = {
    "decision_tree_accuracy": round(dt_accuracy, 4),
    "random_forest_accuracy": round(rf_accuracy, 4),
    "num_diseases": int(train_df["prognosis"].nunique()),
    "num_symptoms": len(symptom_columns),
    "num_training_samples": len(train_df),
}
joblib.dump(comparison, os.path.join(SAVE_DIR, "model_comparison.pkl"))

print("\nModels saved to backend/ml/saved_models/")
print(comparison)
