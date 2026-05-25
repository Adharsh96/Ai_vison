# AI Vision — Academic Risk Intelligence Platform

AI-powered student performance prediction system that identifies at-risk students early and provides explainable intervention recommendations.

**Created by Adharsh M R** — Unauthorized modification or redistribution of modified versions is prohibited.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Python, FastAPI |
| ML | Scikit-learn (DecisionTreeClassifier) |
| Dataset | 1,500 synthetic student records |

---

## Navigation Guide

The app has 8 tabs accessible from the navigation bar. Below is a detailed manual for each.

---

### 1. Home

**Route:** `/`

Landing page with marketing content:

- **Hero section** — Animated headline "Predict Student Risk Using AI", two CTAs ("Try the Predictor" → `/predict`, "View Dashboard" → `/dashboard`), terminal-style preview card
- **Statistics counters** — 1500+ Students Analyzed, 92% Model Accuracy, 10+ Features, 99% Real-time
- **Feature highlights** — 4 glassmorphism cards: AI Prediction, Explainable AI, Real-Time Alerts, Analytics Dashboard
- **How It Works** — 4-step timeline: Input Student Data → ML Model Analysis → Review Results → Take Action
- **Why Early Intervention Matters** — Stats panel showing 40% improvement, 3x effectiveness, 85% accuracy
- **ML Workflow** — Dark-themed section with 6 pipeline steps (Data Collection → Preprocessing → Feature Engineering → Model Training → Evaluation → Deployment)
- **Dataset Insights** — Animated feature importance bars with links to Dataset Explorer and Model Performance pages
- **CTA** — "Get Started Now" button linking to prediction playground

---

### 2. Predict

**Route:** `/predict`

Live prediction form where you enter student data and get instant risk assessment.

**Input fields (10):**

| Field | Range | Description |
|-------|-------|-------------|
| Attendance | 0–100% | Class attendance percentage |
| Study Hours | 0–12 hrs | Hours spent studying per day |
| Assignment Completion | 0–100% | Rate of assignment submission |
| Internal Marks | 0–100 | Internal assessment scores |
| Previous GPA | 0–10 | Previous semester GPA |
| Participation Score | 0–100 | Classroom participation level |
| Sleep Hours | 0–12 hrs | Average daily sleep |
| Internet Access | 0/1 toggle | Has reliable internet |
| Family Support | 0/1 toggle | Receives family educational support |
| Extra-curricular | 0/1 toggle | Involved in extracurricular activities |

Each slider shows the current value. Click **"Predict Risk"** to submit.

**Output:**
- **Risk Level badge** — Green (Low Risk), Yellow (Medium Risk), Red (High Risk)
- **Pass/Fail indicator** — Large checkmark or cross
- **Probability meter** — Animated horizontal bar showing confidence percentage
- **Academic category** — Excellent / Good / Average / At Risk
- **Intervention recommendations** — List of AI-generated suggestions (e.g., "Student requires weekly mentoring")
- **Tutor alerts** — Cards with severity badges and recommended actions

Uses `POST /api/predict` endpoint.

---

### 3. Dashboard

**Route:** `/dashboard`

Analytics dashboard with charts and KPIs sourced from the backend API.

**Overview cards (top row):**
- Total Students — Count of records in dataset
- Pass Rate — Percentage of students predicted to pass
- Avg Attendance — Mean attendance percentage
- Avg GPA — Mean previous GPA

**Charts (2-column grid):**

| Chart | Description |
|-------|-------------|
| Pass vs Fail Ratio | Donut pie chart (green/red) |
| Attendance Distribution | Histogram of attendance ranges |
| GPA Distribution | Histogram of GPA ranges |
| Risk Segmentation | Horizontal bar chart by risk category count |
| Performance Trends | Area chart showing monthly trend |
| Behavioral Impact | Horizontal bar: Attendance, Homework, Participation, Study Hours, GPA impact |
| Feature Correlation with Target | Bar chart showing each feature's correlation with pass/fail (green = positive, red = negative) |

**Data sources:** `GET /api/analytics/overview`, `/analytics/distributions`, `/analytics/correlations`, `/analytics/risk-segments`

---

### 4. Explainable AI

**Route:** `/explainable-ai`

Understand how the ML model makes predictions.

**Left panel — Feature Importance:**

Horizontal bar chart showing all 10 features ranked by importance weight (e.g., internal_marks ~19%, attendance ~15%, participation ~14%). The chart updates from API data at `GET /api/feature-importance`.

**Right panel — Try It form:**

3 sliders (Attendance, Study Hours, Internal Marks). Click **"Generate Explanation"** to:

1. Send data to `POST /api/predict` for a live prediction
2. Send to `POST /api/decision-path` to get the model's decision tree traversal path
3. Display a natural-language explanation (e.g., "The student is classified as High Risk because attendance is 45% (below 60%)...")

**After submission:**
- **Prediction Result** — Dark panel showing risk category and confidence score
- **Decision Path** — Numbered step list showing each decision tree node visited (split conditions and thresholds)
- **Feature Weights** — Table of all features with their importance percentages
- **Risk Contribution** — Animated horizontal progress bars per feature

---

### 5. Alerts

**Route:** `/tutor-alerts`

Simulated tutor alert system that demonstrates how the platform would notify educators about at-risk students.

**How it works:**
- 6 sample student profiles with varying risk indicators are loaded
- Each profile is evaluated against alert rules
- Alerts are generated with severity levels

**Filter buttons:** All | High | Medium | Low

**Alert types generated:**

| Alert Type | Trigger | Severity |
|------------|---------|----------|
| Critical Risk | Attendance < 40% | Critical |
| Attendance Alert | Attendance 40–60% | High |
| Low Study Hours | Study hours < 3 AND attendance < 70% | Medium |
| Assignment Neglect | Assignment completion < 50% | Critical |
| Academic Decline | Marks < 40 AND GPA < 2.5 | Critical |
| Low Participation | Study hours < 2 AND attendance < 50% | Low |

Each alert card shows:
- Alert type and message
- Severity badge with color indicator (red/orange/yellow/gray)
- Recommended action (e.g., "Immediate counselor intervention required")
- Suggested mentoring plan (actionable steps)
- Key student metrics (attendance, study hours, marks, GPA)

---

### 6. Data

**Route:** `/dataset`

Browse and explore the student dataset used for model training.

**Summary cards (top row):**
- Total Records (1,500)
- Pass Count
- Fail Count
- Columns with Missing Values

**Controls:**
- **Search input** — Full-text search across all record fields
- **Risk filter dropdown** — All / High Risk / Medium Risk / Low Risk
- **Random Student button** — Fetches a random record from the API and displays all its fields in a detail panel

**Student records table:**

| Column | Description |
|--------|-------------|
| ID | Auto-generated index |
| Attendance | Percentage |
| Study Hrs | Hours per day |
| Assignments | Completion % |
| Int. Marks | Internal marks |
| Prev GPA | Previous semester GPA |
| Risk | Color-coded badge |

**Pagination** — Page numbers with prev/next buttons, shows page count.

**Data sources:** `GET /api/dataset/summary`, `/api/dataset/students`, `/api/dataset/random-student`

---

### 7. Model

**Route:** `/model-performance`

Technical evaluation of the trained Decision Tree classifier.

**Metric cards (top row, animated counters):**

| Metric | Value |
|--------|-------|
| Accuracy | ~92.9% |
| Precision | ~94.4% |
| Recall | ~92.9% |
| F1 Score | ~93.6% |

**Confusion Matrix —** 2×2 grid showing TN / FP / FN / TP counts with green/red coloring.

**Cross-Validation Scores —** Bar chart showing each fold's accuracy with CV mean.

**Training vs Test Accuracy —** Animated horizontal progress bars comparing training vs held-out test performance.

**Model Information panel:**
- Model Type: Decision Tree (ID3-inspired)
- Criterion: entropy
- Dataset Size: 1,500 records
- Features: 10 academic/behavioral attributes
- "Why Decision Tree?" explanation card

**Data source:** `GET /api/model-metrics`

---

### 8. Architecture

**Route:** `/architecture`

Visual overview of the system's design.

**Workflow diagram —** 6-step flow with alternating left/right layout and animated connecting arrows:

1. **Frontend (React)** — UI with TypeScript, Tailwind, Recharts, Framer Motion
2. **API Layer (FastAPI)** — RESTful endpoints for prediction and analytics
3. **ML Engine (Scikit-learn)** — Decision Tree classifier
4. **Prediction System** — Real-time risk assessment pipeline
5. **Tutor Alert Engine** — Rule-based alert generation
6. **Dashboard Analytics** — Aggregated insights and visualizations

**Tech Stack grid** — 9 technology cards with hover effects.

**Deployment Architecture** — 3-column layout:
- Frontend Hosting (Vite static build, CDN)
- API Server (FastAPI + Uvicorn, scalable)
- ML Model Serving (joblib serialized, loaded at startup)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Predict student risk from 10 features |
| GET | `/api/feature-importance` | Get feature importance weights |
| POST | `/api/decision-path` | Get decision tree traversal path |
| GET | `/api/analytics/overview` | Aggregate dashboard stats |
| GET | `/api/analytics/distributions` | Histogram data for charts |
| GET | `/api/analytics/correlations` | Feature correlation with target |
| GET | `/api/analytics/risk-segments` | Risk category averages |
| GET | `/api/dataset/summary` | Dataset statistics |
| GET | `/api/dataset/students` | Paginated student records |
| GET | `/api/dataset/random-student` | Random student record |
| GET | `/api/model-metrics` | Model evaluation metrics |
| GET | `/health` | Health check |

---

## Running Locally

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deployment

### Vercel (Frontend)

Deploy the React frontend on Vercel for **free** (no credit card needed):

1. Go to [Vercel](https://vercel.com/new) and import your `Ai_vison` repo
2. **Root Directory**: set to `frontend/`
3. Vite auto-detects as the framework
4. **No build command or output directory changes needed**
5. After deploy, add this environment variable in Vercel project settings:
   - **Key**: `VITE_API_URL`
   - **Value**: your PythonAnywhere backend URL (see below)
   - **Environment**: Production
6. **Redeploy** after adding the variable

Your frontend will be live at `https://ai-vison.vercel.app` (or your Vercel subdomain).

### PythonAnywhere (Backend API — Free, no credit card)

1. Go to [PythonAnywhere](https://www.pythonanywhere.com/) and create a **Free** account
2. Go to **Dashboard → Web → Add a new web app**
3. Choose **Manual configuration** → **Python 3.10**
4. Open the **Files** tab and upload these files (preserving structure):
   - `backend/app/` (entire folder)
   - `backend/requirements.txt`
   - `datasets/student_performance.csv`
   - `model/trained_model.pkl`
5. Open a **Bash console** and run:
   ```bash
   pip install --user -r backend/requirements.txt
   ```
6. Go to **Web → WSGI configuration file** and replace the content with:
   ```python
   import sys, os
   sys.path.insert(0, os.path.dirname(__file__))
   from app.main import app
   ```
7. Go to **Web → Static files**: add `/static/` → your static directory (optional)
8. Click **Reload** at the top of the Web page
9. Your API URL will be: `https://yourusername.pythonanywhere.com`

10. Go back to your **Vercel** project settings, add:
    - **Key**: `VITE_API_URL`
    - **Value**: `https://yourusername.pythonanywhere.com`
    - Redeploy Vercel

### Local Development (No changes needed)

```bash
# Terminal 1 — Backend (starts on port 8000)
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (starts on port 5173, proxies /api to localhost:8000)
cd frontend && npm run dev
```

---

## Credits

© 2026 **Adharsh M R**. All rights reserved.

This software is provided for use with attribution. You may use, run, and deploy it for any purpose, provided that the original copyright notice and attribution to Adharsh M R are included in all copies or substantial portions of the software.

**Modification and redistribution of modified versions are prohibited** without explicit written permission from the author.

See the [LICENSE](LICENSE) file for full terms.
