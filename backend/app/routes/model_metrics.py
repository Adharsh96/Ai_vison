from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import cross_val_score

router = APIRouter(prefix='/api', tags=['Model Metrics'])

FEATURES = [
    'attendance', 'study_hours', 'assignment_completion', 'internal_marks',
    'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
    'family_support', 'extra_curricular'
]

def get_model_and_data():
    model_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'trained_model.pkl')
    model_path = os.path.abspath(model_path)
    if not os.path.exists(model_path):
        alt_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'trained_model.pkl')
        alt_path = os.path.abspath(alt_path)
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            raise FileNotFoundError("Model not found")

    model = joblib.load(model_path)

    test_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'datasets', 'test.csv')
    test_path = os.path.abspath(test_path)
    if not os.path.exists(test_path):
        alt_test = os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'test.csv')
        alt_test = os.path.abspath(alt_test)
        if os.path.exists(alt_test):
            test_path = alt_test
        else:
            raise FileNotFoundError("Test dataset not found")

    test_df = pd.read_csv(test_path)
    return model, test_df

@router.get('/model-metrics')
async def model_metrics():
    try:
        model, test_df = get_model_and_data()
        X_test = test_df[FEATURES]
        y_test = test_df['pass_status']
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        train_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'datasets', 'train.csv'))
        X_train = train_df[FEATURES]
        y_train = train_df['pass_status']
        train_pred = model.predict(X_train)

        cm = confusion_matrix(y_test, y_pred).tolist()

        cv_scores = cross_val_score(model, pd.concat([X_train, X_test]), pd.concat([y_train, y_test]), cv=5)

        total_dataset = len(train_df) + len(test_df)

        return {
            'success': True,
            'data': {
                'accuracy': round(accuracy_score(y_test, y_pred), 4),
                'precision': round(precision_score(y_test, y_pred), 4),
                'recall': round(recall_score(y_test, y_pred), 4),
                'f1_score': round(f1_score(y_test, y_pred), 4),
                'train_accuracy': round(accuracy_score(y_train, train_pred), 4),
                'confusion_matrix': cm,
                'cv_scores': [round(s, 4) for s in cv_scores],
                'cv_mean': round(float(cv_scores.mean()), 4),
                'cv_std': round(float(cv_scores.std()), 4),
                'dataset_size': int(total_dataset),
                'test_size': int(len(test_df)),
                'train_size': int(len(train_df)),
                'model_type': 'Decision Tree (ID3-inspired)',
                'criterion': 'entropy'
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
