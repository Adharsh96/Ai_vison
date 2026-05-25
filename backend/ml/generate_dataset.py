import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os

np.random.seed(42)
n = 1500

student_ids = [f'STU-{i+1:04d}' for i in range(n)]

data = {
    'student_id': student_ids,
    'attendance': np.clip(np.random.normal(75, 20, n), 0, 100).astype(int),
    'study_hours': np.clip(np.random.exponential(3, n), 0.5, 12).round(1),
    'assignment_completion': np.clip(np.random.normal(70, 25, n), 0, 100).astype(int),
    'internal_marks': np.clip(np.random.normal(65, 20, n), 0, 100).astype(int),
    'previous_gpa': np.clip(np.random.normal(7.0, 2.0, n), 0, 10).round(2),
    'participation_score': np.clip(np.random.normal(60, 25, n), 0, 100).astype(int),
    'sleep_hours': np.clip(np.random.normal(7, 1.5, n), 3, 12).round(1),
    'internet_access': np.random.choice([0, 1], n, p=[0.15, 0.85]),
    'family_support': np.random.choice([0, 1], n, p=[0.3, 0.7]),
    'extra_curricular': np.random.choice([0, 1], n, p=[0.45, 0.55]),
}

df = pd.DataFrame(data)

risk_score = (
    (df['attendance'] < 60).astype(int) * 3 +
    (df['study_hours'] < 3).astype(int) * 2 +
    (df['assignment_completion'] < 50).astype(int) * 3 +
    (df['internal_marks'] < 50).astype(int) * 3 +
    (df['previous_gpa'] < 5.0).astype(int) * 2 +
    (df['participation_score'] < 40).astype(int) * 2 +
    (df['sleep_hours'] < 5).astype(int) * 1 +
    (df['internet_access'] == 0).astype(int) * 1 +
    (df['family_support'] == 0).astype(int) * 1 +
    (df['extra_curricular'] == 0).astype(int) * 1
)

def categorize(row):
    s = risk_score.iloc[row.name] if hasattr(risk_score, 'iloc') else risk_score[row.index]
    if s >= 12:
        return 'High Risk'
    elif s >= 6:
        return 'Medium Risk'
    else:
        return 'Low Risk'

df['risk_category'] = df.apply(categorize, axis=1)
df['pass_status'] = df['risk_category'].map({'Low Risk': 1, 'Medium Risk': 0, 'High Risk': 0})
noise = np.random.random(n) * 0.1
df['pass_status'] = ((df['pass_status'] + noise) > 0.5).astype(int)

os.makedirs('datasets', exist_ok=True)
df.to_csv('datasets/student_performance.csv', index=False)
print(f"Dataset saved: {len(df)} records")
print(df['risk_category'].value_counts())
print(df['pass_status'].value_counts())

train, temp = train_test_split(df, test_size=0.3, random_state=42)
val, test = train_test_split(temp, test_size=0.5, random_state=42)
train.to_csv('datasets/train.csv', index=False)
val.to_csv('datasets/val.csv', index=False)
test.to_csv('datasets/test.csv', index=False)
print(f"Train: {len(train)}, Val: {len(val)}, Test: {len(test)}")
