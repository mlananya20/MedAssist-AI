# """
# Module 1 + Module 4: Prediction + Explainability
# Loads the trained Random Forest model and turns a list of symptoms
# into top-3 disease predictions with confidence scores and explanations.
# """
# import os
# import joblib
# import numpy as np

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# SAVE_DIR = os.path.join(BASE_DIR, "saved_models")

# # Loaded once when the server starts, not on every request
# rf_model = joblib.load(os.path.join(SAVE_DIR, "random_forest_model.pkl"))
# dt_model = joblib.load(os.path.join(SAVE_DIR, "decision_tree_model.pkl"))
# symptom_columns = joblib.load(os.path.join(SAVE_DIR, "symptom_columns.pkl"))


# def symptoms_to_vector(user_symptoms):
#     """
#     Converts a list like ["fever", "headache"] into the 132-length
#     binary vector the model expects, in the exact column order it was trained on.
#     """
#     vector = [0] * len(symptom_columns)
#     unmatched = []
#     for symptom in user_symptoms:
#         key = symptom.strip().lower().replace(" ", "_")
#         if key in symptom_columns:
#             vector[symptom_columns.index(key)] = 1
#         else:
#             unmatched.append(symptom)
#     return vector, unmatched


# def predict_disease(user_symptoms, model=rf_model, top_n=3):
#     """
#     Returns top_n diseases with confidence scores, e.g.:
#     [{"disease": "Flu", "confidence": 94.2}, ...]
#     """
#     vector, unmatched = symptoms_to_vector(user_symptoms)
#     probabilities = model.predict_proba([vector])[0]
#     classes = model.classes_

#     ranked = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)
#     top_predictions = [
#         {"disease": disease, "confidence": round(float(prob) * 100, 2)}
#         for disease, prob in ranked[:top_n]
#     ]
#     return top_predictions, unmatched


# def explain_prediction(user_symptoms, model=rf_model):
#     """
#     Module 4: Explainable AI.
#     Uses the Random Forest's feature_importances_ to show which of the
#     user's reported symptoms contributed most to the top prediction.
#     This is a simple, honest form of explainability (global feature
#     importance filtered to the symptoms the user actually reported) —
#     good enough for a student project and easy to explain in interviews.
#     """
#     vector, unmatched = symptoms_to_vector(user_symptoms)
#     reported_indices = [i for i, v in enumerate(vector) if v == 1]

#     importances = model.feature_importances_
#     reported_importances = [
#         (symptom_columns[i], importances[i]) for i in reported_indices
#     ]
#     reported_importances.sort(key=lambda x: x[1], reverse=True)

#     total = sum(imp for _, imp in reported_importances) or 1
#     explanation = [
#         {
#             "symptom": symptom.replace("_", " ").title(),
#             "contribution_percent": round((imp / total) * 100, 1),
#         }
#         for symptom, imp in reported_importances
#     ]
#     return explanation


# def compare_models(user_symptoms):
#     """Module 1: Compare Decision Tree vs Random Forest on the same input."""
#     dt_preds, _ = predict_disease(user_symptoms, model=dt_model, top_n=1)
#     rf_preds, _ = predict_disease(user_symptoms, model=rf_model, top_n=1)
#     return {"decision_tree": dt_preds[0], "random_forest": rf_preds[0]}


# if __name__ == "__main__":
#     # Quick manual test — replace with symptoms that exist in your dataset's columns
#     test_symptoms = ["high_fever", "headache", "fatigue"]
#     predictions, unmatched = predict_disease(test_symptoms)
#     print("Top 3 predictions:", predictions)
#     print("Unmatched symptoms (check spelling/underscore format):", unmatched)
#     print("Explanation:", explain_prediction(test_symptoms))


"""
Module 1 + Module 4: Prediction + Explainability
Loads the trained Random Forest model and turns a list of symptoms
into top-3 disease predictions with confidence scores and explanations.
"""
import os
import re
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR = os.path.join(BASE_DIR, "saved_models")

# Loaded once when the server starts, not on every request
rf_model = joblib.load(os.path.join(SAVE_DIR, "random_forest_model.pkl"))
dt_model = joblib.load(os.path.join(SAVE_DIR, "decision_tree_model.pkl"))
symptom_columns = joblib.load(os.path.join(SAVE_DIR, "symptom_columns.pkl"))


def _normalize(text):
    """
    Strips everything except letters and numbers, lowercased.
    This dataset has inconsistent column names (e.g. 'dischromic _patches'
    with a stray space instead of 'dischromic_patches'), so comparing on
    spaces/underscores directly is fragile. Reducing both the stored
    column names and user input to bare alphanumerics makes matching
    robust to that kind of formatting noise.
    """
    return re.sub(r"[^a-z0-9]", "", text.lower())


# Build once: normalized column name -> its index in the feature vector
_normalized_lookup = {_normalize(col): idx for idx, col in enumerate(symptom_columns)}


def symptoms_to_vector(user_symptoms):
    """
    Converts a list like ["fever", "headache"] into the 132-length
    binary vector the model expects, in the exact column order it was trained on.
    """
    vector = [0] * len(symptom_columns)
    unmatched = []
    for symptom in user_symptoms:
        key = _normalize(symptom)
        if key in _normalized_lookup:
            vector[_normalized_lookup[key]] = 1
        else:
            unmatched.append(symptom)
    return vector, unmatched


def predict_disease(user_symptoms, model=rf_model, top_n=3):
    """
    Returns top_n diseases with confidence scores, e.g.:
    [{"disease": "Flu", "confidence": 94.2}, ...]
    """
    vector, unmatched = symptoms_to_vector(user_symptoms)
    probabilities = model.predict_proba([vector])[0]
    classes = model.classes_

    ranked = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)
    top_predictions = [
        {"disease": disease, "confidence": round(float(prob) * 100, 2)}
        for disease, prob in ranked[:top_n]
    ]
    return top_predictions, unmatched


def explain_prediction(user_symptoms, model=rf_model):
    """
    Module 4: Explainable AI.
    Uses the Random Forest's feature_importances_ to show which of the
    user's reported symptoms contributed most to the top prediction.
    This is a simple, honest form of explainability (global feature
    importance filtered to the symptoms the user actually reported) —
    good enough for a student project and easy to explain in interviews.
    """
    vector, unmatched = symptoms_to_vector(user_symptoms)
    reported_indices = [i for i, v in enumerate(vector) if v == 1]

    importances = model.feature_importances_
    reported_importances = [
        (symptom_columns[i], importances[i]) for i in reported_indices
    ]
    reported_importances.sort(key=lambda x: x[1], reverse=True)

    total = sum(imp for _, imp in reported_importances) or 1
    explanation = [
        {
            "symptom": symptom.replace("_", " ").title(),
            "contribution_percent": round((imp / total) * 100, 1),
        }
        for symptom, imp in reported_importances
    ]
    return explanation


def compare_models(user_symptoms):
    """Module 1: Compare Decision Tree vs Random Forest on the same input."""
    dt_preds, _ = predict_disease(user_symptoms, model=dt_model, top_n=1)
    rf_preds, _ = predict_disease(user_symptoms, model=rf_model, top_n=1)
    return {"decision_tree": dt_preds[0], "random_forest": rf_preds[0]}


if __name__ == "__main__":
    # Quick manual test — replace with symptoms that exist in your dataset's columns
    test_symptoms = ["high_fever", "headache", "fatigue"]
    predictions, unmatched = predict_disease(test_symptoms)
    print("Top 3 predictions:", predictions)
    print("Unmatched symptoms (check spelling/underscore format):", unmatched)
    print("Explanation:", explain_prediction(test_symptoms))