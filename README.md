# MedAssist AI — Intelligent Healthcare Assistant

An AI-powered healthcare platform that predicts diseases from symptoms, explains its
reasoning, and gives personalized recommendations.

## Project Structure
```
MedAssist-AI/
├── backend/
│   ├── api/          # Flask routes (predict, auth, chat, hospitals...)
│   ├── ml/            # Model training, prediction, explainability
│   ├── database/      # DB models & connection (SQLite)
│   ├── utils/          # Helpers (BMI calc, health score, etc.)
│   ├── reports/        # Generated PDF medical reports
│   ├── tests/           # Backend & ML tests
│   ├── app.py            # Flask entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── public/
└── docs/               # Architecture diagram, API docs, screenshots
```

## Build Order (recommended)
1. **Module 1 — Disease Prediction**: dataset + train Decision Tree & Random Forest in `backend/ml/`
2. **Module 4 — Explainable AI**: feature contribution breakdown
3. **Module 3 — Health Profile**: user inputs stored, personalizes output
4. **Module 13 — Auth**: JWT login/signup
5. **Module 7 — Prediction History**: store every prediction in SQLite
6. **Module 6 — Analytics Dashboard**: charts on top of history data
7. **Module 8 — PDF Report**: generate report per prediction
8. **Module 2 — Chat Assistant**: rule-based first, LLM API later
9. **Module 9 — Hospital Finder**: OpenStreetMap API
10. **Module 15 — Deployment**: Render/Railway + Vercel/Netlify

## Getting Started (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Then visit `http://localhost:5000/api/health` — you should see `{"status": "ok"}`.

## Getting Started (Frontend)
We'll scaffold this with React once the prediction API is working (Module 1 first,
UI second — always build from data outward).

## Tech Stack
Python · Flask · Scikit-learn · SQLite · JWT · React · Chart.js
