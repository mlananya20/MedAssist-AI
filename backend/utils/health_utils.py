# """
# Module 3: Turns raw profile numbers into personalized, human-readable advice.
# This is what upgrades "Drink water" into
# "Based on your BMI and age, increase hydration and avoid cold drinks."
# """


# def calculate_bmi(weight_kg, height_cm):
#     if not weight_kg or not height_cm:
#         return None
#     height_m = height_cm / 100
#     bmi = weight_kg / (height_m ** 2)
#     return round(bmi, 1)


# def bmi_category(bmi):
#     if bmi is None:
#         return "Unknown"
#     if bmi < 18.5:
#         return "Underweight"
#     elif bmi < 25:
#         return "Normal weight"
#     elif bmi < 30:
#         return "Overweight"
#     else:
#         return "Obese"


# def get_personalized_recommendations(profile, predicted_disease=None):
#     """
#     Returns a list of personalized tip strings based on the user's profile
#     (and optionally the currently predicted disease).
#     Deliberately rule-based and explainable — no LLM needed for this part.
#     """
#     tips = []
#     if not profile:
#         return ["Add your health profile for personalized recommendations."]

#     bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm"))
#     category = bmi_category(bmi)
#     age = profile.get("age")

#     if bmi is not None:
#         if category == "Underweight":
#             tips.append(
#                 f"Your BMI is {bmi} ({category}). Focus on nutrient-dense meals "
#                 "and consider consulting a nutritionist about a gradual weight gain plan."
#             )
#         elif category == "Normal weight":
#             tips.append(
#                 f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
#                 "increase hydration and avoid cold drinks during illness."
#             )
#         elif category == "Overweight":
#             tips.append(
#                 f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
#                 "prioritize hydration, light daily activity, and avoid sugary drinks."
#             )
#         else:  # Obese
#             tips.append(
#                 f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
#                 "consult a doctor for a personalized diet and activity plan, and stay well hydrated."
#             )

#     if age is not None:
#         if age >= 60:
#             tips.append("Given your age, monitor symptoms closely and seek care earlier rather than later.")
#         elif age <= 12:
#             tips.append("For children, dosages and care steps differ from adults — consult a pediatrician.")

#     allergies = profile.get("allergies")
#     if allergies:
#         tips.append(f"Reminder: you've noted allergies to {allergies} — flag this to any doctor you consult.")

#     if predicted_disease:
#         tips.append(f"These tips are shown alongside your current prediction: {predicted_disease}.")

#     return tips

"""
Module 3: Turns raw profile numbers into personalized, human-readable advice.
This is what upgrades "Drink water" into
"Based on your BMI and age, increase hydration and avoid cold drinks."
"""


def calculate_bmi(weight_kg, height_cm):
    if not weight_kg or not height_cm:
        return None
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 1)


def bmi_category(bmi):
    if bmi is None:
        return "Unknown"
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"


def get_personalized_recommendations(profile, predicted_disease=None):
    """
    Returns a list of personalized tip strings based on the user's profile
    (and optionally the currently predicted disease).
    Deliberately rule-based and explainable — no LLM needed for this part.
    """
    tips = []
    if not profile:
        return ["Add your health profile for personalized recommendations."]

    bmi = calculate_bmi(profile.get("weight_kg"), profile.get("height_cm"))
    category = bmi_category(bmi)
    age = profile.get("age")

    if bmi is not None:
        if category == "Underweight":
            tips.append(
                f"Your BMI is {bmi} ({category}). Focus on nutrient-dense meals "
                "and consider consulting a nutritionist about a gradual weight gain plan."
            )
        elif category == "Normal weight":
            tips.append(
                f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
                "increase hydration and avoid cold drinks during illness."
            )
        elif category == "Overweight":
            tips.append(
                f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
                "prioritize hydration, light daily activity, and avoid sugary drinks."
            )
        else:  # Obese
            tips.append(
                f"Your BMI is {bmi} ({category}). Based on your BMI and age, "
                "consult a doctor for a personalized diet and activity plan, and stay well hydrated."
            )

    if age is not None:
        if age >= 60:
            tips.append("Given your age, monitor symptoms closely and seek care earlier rather than later.")
        elif age <= 12:
            tips.append("For children, dosages and care steps differ from adults — consult a pediatrician.")

    allergies = profile.get("allergies")
    if allergies and allergies.strip().lower() not in ("", "none", "n/a", "na"):
        tips.append(f"Reminder: you've noted allergies to {allergies} — flag this to any doctor you consult.")

    if predicted_disease:
        tips.append(f"These tips are shown alongside your current prediction: {predicted_disease}.")

    return tips