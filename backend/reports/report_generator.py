"""
Module 8: Generates a professional-looking PDF medical report.
"""
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_report(user_id, profile, symptoms, predictions, explanation, recommendations, output_path=None):
    if output_path is None:
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_user = user_id.replace("@", "_at_").replace(".", "_")
        output_path = os.path.join(BASE_DIR, f"report_{safe_user}_{timestamp}.pdf")

    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        topMargin=0.7 * inch, bottomMargin=0.7 * inch,
        leftMargin=0.7 * inch, rightMargin=0.7 * inch,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"], fontSize=20, textColor=colors.HexColor("#1B2B29"),
    )
    section_style = ParagraphStyle(
        "SectionHeader", parent=styles["Heading2"], fontSize=13,
        textColor=colors.HexColor("#2F6F62"), spaceBefore=16, spaceAfter=8,
    )
    normal_style = ParagraphStyle("NormalText", parent=styles["Normal"], fontSize=10.5, leading=15)
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=styles["Normal"], fontSize=8.5,
        textColor=colors.HexColor("#666666"), spaceBefore=20,
    )

    story = []

    # ---- Header ----
    story.append(Paragraph("MedAssist AI — Medical Prediction Report", title_style))
    story.append(Paragraph(
        f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}",
        normal_style,
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D7E0DC"), spaceBefore=10, spaceAfter=6))

    # ---- Patient details ----
    story.append(Paragraph("Patient Details", section_style))
    profile = profile or {}
    bmi = None
    if profile.get("weight_kg") and profile.get("height_cm"):
        height_m = profile["height_cm"] / 100
        bmi = round(profile["weight_kg"] / (height_m ** 2), 1)

    patient_rows = [
        ["Email", user_id],
        ["Age", str(profile.get("age", "—"))],
        ["Gender", str(profile.get("gender", "—")).title()],
        ["Height", f"{profile.get('height_cm', '—')} cm"],
        ["Weight", f"{profile.get('weight_kg', '—')} kg"],
        ["BMI", str(bmi) if bmi else "—"],
        ["Allergies", profile.get("allergies") or "None reported"],
        ["Medical history", profile.get("medical_history") or "None reported"],
    ]
    patient_table = Table(patient_rows, colWidths=[1.6 * inch, 4.4 * inch])
    patient_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#4B5D59")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#EDF1EE")),
    ]))
    story.append(patient_table)

    # ---- Reported symptoms ----
    story.append(Paragraph("Reported Symptoms", section_style))
    story.append(Paragraph(", ".join(s.replace("_", " ").title() for s in symptoms), normal_style))

    # ---- Prediction ----
    story.append(Paragraph("Disease Prediction", section_style))
    pred_rows = [["Disease", "Confidence"]] + [
        [p["disease"], f"{p['confidence']}%"] for p in predictions
    ]
    pred_table = Table(pred_rows, colWidths=[4 * inch, 2 * inch])
    pred_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2F6F62")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, 1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7E0DC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAF8")]),
    ]))
    story.append(pred_table)

    # ---- Explainability ----
    if explanation:
        story.append(Paragraph("Why This Prediction", section_style))
        exp_rows = [["Symptom", "Contribution"]] + [
            [e["symptom"], f"{e['contribution_percent']}%"] for e in explanation
        ]
        exp_table = Table(exp_rows, colWidths=[4 * inch, 2 * inch])
        exp_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#4B5D59")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.75, colors.HexColor("#D7E0DC")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(exp_table)

    # ---- Personalized recommendations ----
    if recommendations:
        story.append(Paragraph("Suggestions", section_style))
        for tip in recommendations:
            story.append(Paragraph(f"•  {tip}", normal_style))

    # ---- Disclaimer ----
    story.append(Paragraph(
        "This report was generated by an educational AI project using a machine learning model "
        "trained on a synthetic symptom dataset. It is not a medical diagnosis. Please consult a "
        "licensed physician for any health concerns.",
        disclaimer_style,
    ))

    doc.build(story)
    return output_path
