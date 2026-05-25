import joblib
import os
import pandas as pd
import numpy as np

FEATURES = [
    'attendance', 'study_hours', 'assignment_completion', 'internal_marks',
    'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
    'family_support', 'extra_curricular'
]

_model = None

def get_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'trained_model.pkl')
        model_path = os.path.abspath(model_path)
        if os.path.exists(model_path):
            _model = joblib.load(model_path)
        else:
            alt_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'trained_model.pkl')
            alt_path = os.path.abspath(alt_path)
            if os.path.exists(alt_path):
                _model = joblib.load(alt_path)
            else:
                raise FileNotFoundError(f"Model not found at {model_path} or {alt_path}")
    return _model

def predict_student(data: dict) -> dict:
    model = get_model()
    df = pd.DataFrame([{k: data.get(k, 0) for k in FEATURES}])
    proba = model.predict_proba(df)[0]
    pred = model.predict(df)[0]

    prob_pass = float(proba[1])
    risk_score_val = 1 - prob_pass

    if risk_score_val >= 0.6:
        risk_level = 'High Risk'
    elif risk_score_val >= 0.3:
        risk_level = 'Medium Risk'
    else:
        risk_level = 'Low Risk'

    if prob_pass >= 0.7:
        category = 'Excellent'
    elif prob_pass >= 0.5:
        category = 'Good'
    elif prob_pass >= 0.3:
        category = 'Average'
    else:
        category = 'At Risk'

    recommendations = generate_recommendations(data, risk_level)
    tutor_alerts = generate_tutor_alerts(data, risk_level)

    return {
        'pass_prediction': 'Pass' if pred == 1 else 'Fail',
        'risk_level': risk_level,
        'probability_pass': round(prob_pass, 4),
        'probability_fail': round(1 - prob_pass, 4),
        'academic_category': category,
        'recommendations': recommendations,
        'tutor_alerts': tutor_alerts
    }

def generate_recommendations(data: dict, risk_level: str) -> list:
    recs = []
    if data.get('attendance', 100) < 60:
        recs.append('Student requires attendance monitoring and intervention')
    if data.get('study_hours', 12) < 3:
        recs.append('Student needs structured study schedule and academic counseling')
    if data.get('assignment_completion', 100) < 50:
        recs.append('Assignment completion risk detected - weekly check-ins recommended')
    if data.get('internal_marks', 100) < 50:
        recs.append('Student requires subject-specific tutoring and remedial classes')
    if data.get('previous_gpa', 10) < 5.0:
        recs.append('Low academic foundation - recommend foundational skill building')
    if data.get('participation_score', 100) < 40:
        recs.append('Encourage classroom participation and group activities')
    if data.get('sleep_hours', 7) < 5:
        recs.append('Sleep deprivation detected - recommend health and wellness check')
    if risk_level == 'High Risk':
        recs.append('Immediate intervention required - assign academic mentor')
        recs.append('Develop personalized learning plan with weekly progress tracking')
    elif risk_level == 'Medium Risk':
        recs.append('Regular monitoring and bi-weekly mentoring sessions recommended')
    else:
        recs.append('Continue current academic support and enrichment activities')
    return recs

def generate_tutor_alerts(data: dict, risk_level: str) -> list:
    alerts = []
    if risk_level == 'High Risk':
        alerts.append({'type': 'Critical Risk', 'severity': 'high', 'action': 'Immediate parent-teacher meeting required'})
    if data.get('attendance', 100) < 60:
        alerts.append({'type': 'Attendance Alert', 'severity': 'high', 'action': 'Chronic absenteeism - attendance officer介入 needed'})
    if data.get('study_hours', 12) < 3:
        alerts.append({'type': 'Low Study Hours', 'severity': 'medium', 'action': 'Student not meeting minimum study requirements'})
    if data.get('assignment_completion', 100) < 50:
        alerts.append({'type': 'Assignment Neglect', 'severity': 'medium', 'action': 'Multiple pending assignments - tutor follow-up required'})
    if data.get('internal_marks', 100) < 50:
        alerts.append({'type': 'Academic Decline', 'severity': 'high', 'action': 'Falling behind in internal assessments'})
    if data.get('participation_score', 100) < 40:
        alerts.append({'type': 'Low Participation', 'severity': 'low', 'action': 'Student disengaged from classroom activities'})
    return alerts

def get_feature_importance() -> list:
    model = get_model()
    importances = model.feature_importances_
    features = sorted(zip(FEATURES, importances), key=lambda x: x[1], reverse=True)
    return [{'feature': f, 'importance': round(i, 4)} for f, i in features]

def get_decision_path(data: dict) -> dict:
    model = get_model()
    df = pd.DataFrame([{k: data.get(k, 0) for k in FEATURES}])
    leaf_id = model.apply(df)[0]
    n_nodes = model.tree_.node_count
    children_left = model.tree_.children_left
    children_right = model.tree_.children_right
    feature = model.tree_.feature
    threshold = model.tree_.threshold

    node_indicator = model.decision_path(df)
    node_index = node_indicator.indices[node_indicator.indptr[0]:node_indicator.indptr[1]]

    path = []
    for node_id in node_index:
        if leaf_id == node_id:
            path.append({
                'node': int(node_id),
                'type': 'leaf',
                'value': int(model.tree_.value[node_id].argmax(axis=1)[0])
            })
        else:
            fname = FEATURES[feature[node_id]]
            thresh = float(threshold[node_id])
            go_left = (df.iloc[0][fname] <= thresh)
            path.append({
                'node': int(node_id),
                'type': 'split',
                'feature': fname,
                'threshold': round(thresh, 2),
                'decision': f"{fname} <= {thresh:.2f}" if go_left else f"{fname} > {thresh:.2f}"
            })
    return {'path': path, 'leaf_id': int(leaf_id)}
