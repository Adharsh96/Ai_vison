import pandas as pd
import numpy as np
import joblib
import os
import sys
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import cross_val_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

FEATURES = [
    'attendance', 'study_hours', 'assignment_completion', 'internal_marks',
    'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
    'family_support', 'extra_curricular'
]

def load_data():
    train = pd.read_csv('datasets/train.csv')
    val = pd.read_csv('datasets/val.csv')
    test = pd.read_csv('datasets/test.csv')
    return train, val, test

def train_model():
    train, val, test = load_data()
    X_train = train[FEATURES]
    y_train = train['pass_status']
    X_val = val[FEATURES]
    y_val = val['pass_status']
    X_test = test[FEATURES]
    y_test = test['pass_status']

    clf = DecisionTreeClassifier(criterion='entropy', max_depth=10, min_samples_split=10, random_state=42)
    clf.fit(X_train, y_train)

    for name, X, y in [('Train', X_train, y_train), ('Val', X_val, y_val), ('Test', X_test, y_test)]:
        preds = clf.predict(X)
        print(f"\n{name} Set:")
        print(f"  Accuracy:  {accuracy_score(y, preds):.4f}")
        print(f"  Precision: {precision_score(y, preds):.4f}")
        print(f"  Recall:    {recall_score(y, preds):.4f}")
        print(f"  F1 Score:  {f1_score(y, preds):.4f}")
        print(f"  Confusion Matrix:\n{confusion_matrix(y, preds)}")

    cv_scores = cross_val_score(clf, pd.concat([X_train, X_val]), pd.concat([y_train, y_val]), cv=5)
    print(f"\nCross-Validation Scores: {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

    os.makedirs('model', exist_ok=True)
    joblib.dump(clf, 'model/trained_model.pkl')
    print("\nModel saved to model/trained_model.pkl")

    feat_importance = pd.DataFrame({
        'feature': FEATURES,
        'importance': clf.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importances:")
    print(feat_importance)

    return clf

if __name__ == '__main__':
    train_model()
