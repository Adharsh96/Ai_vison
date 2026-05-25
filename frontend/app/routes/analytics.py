from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np
import os
import json
import math
import hashlib

router = APIRouter(prefix='/api', tags=['Analytics'])

FEATURES = [
    'attendance', 'study_hours', 'assignment_completion', 'internal_marks',
    'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
    'family_support', 'extra_curricular'
]

def get_dataset():
    path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'datasets', 'student_performance.csv')
    path = os.path.abspath(path)
    if not os.path.exists(path):
        alt_path = os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'student_performance.csv')
        alt_path = os.path.abspath(alt_path)
        if os.path.exists(alt_path):
            path = alt_path
        else:
            raise FileNotFoundError(f"Dataset not found")
    return pd.read_csv(path)

def convert_types(obj):
    if isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    if isinstance(obj, (np.float64, np.float32)):
        return float(obj)
    if isinstance(obj, np.bool_):
        return bool(obj)
    return obj

@router.get('/analytics/overview')
async def analytics_overview():
    try:
        df = get_dataset()
        total = len(df)
        pass_count = int(df['pass_status'].sum())
        fail_count = total - pass_count
        risk_counts = df['risk_category'].value_counts().to_dict()

        avg_attendance = float(df['attendance'].mean())
        avg_marks = float(df['internal_marks'].mean())
        avg_gpa = float(df['previous_gpa'].mean())
        avg_study = float(df['study_hours'].mean())

        pass_rate = round(pass_count / total * 100, 1)
        fail_rate = round(fail_count / total * 100, 1)

        return {
            'success': True,
            'data': {
                'total_students': total,
                'pass_count': pass_count,
                'fail_count': fail_count,
                'pass_rate': pass_rate,
                'fail_rate': fail_rate,
                'risk_distribution': {k: int(v) for k, v in risk_counts.items()},
                'averages': {
                    'attendance': round(avg_attendance, 1),
                    'internal_marks': round(avg_marks, 1),
                    'previous_gpa': round(avg_gpa, 2),
                    'study_hours': round(avg_study, 1)
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/analytics/distributions')
async def analytics_distributions():
    try:
        df = get_dataset()
        pass_df = df[df['pass_status'] == 1]
        fail_df = df[df['pass_status'] == 0]

        def hist_bins(series, bins=10):
            counts, edges = np.histogram(series, bins=bins)
            return [{'range': f'{round(edges[i],1)}-{round(edges[i+1],1)}', 'count': int(counts[i])} for i in range(len(counts)) if counts[i] > 0]

        return {
            'success': True,
            'data': {
                'attendance': hist_bins(df['attendance']),
                'internal_marks': hist_bins(df['internal_marks']),
                'study_hours': hist_bins(df['study_hours']),
                'gpa': hist_bins(df['previous_gpa']),
                'assignment_completion': hist_bins(df['assignment_completion']),
                'participation_score': hist_bins(df['participation_score']),
                'pass_attendance': hist_bins(pass_df['attendance']),
                'fail_attendance': hist_bins(fail_df['attendance']),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/analytics/correlations')
async def analytics_correlations():
    try:
        df = get_dataset()
        features = ['attendance', 'study_hours', 'assignment_completion', 'internal_marks',
                     'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
                     'family_support', 'extra_curricular']
        corr_matrix = df[features + ['pass_status']].corr().round(3)
        corr_with_target = corr_matrix['pass_status'].drop('pass_status').to_dict()
        corr_with_target = {k: float(v) for k, v in corr_with_target.items()}

        corr_pairs = []
        for i in range(len(features)):
            for j in range(i+1, len(features)):
                corr_pairs.append({
                    'x': features[i],
                    'y': features[j],
                    'value': float(corr_matrix.loc[features[i], features[j]])
                })

        return {
            'success': True,
            'data': {
                'target_correlation': corr_with_target,
                'feature_pairs': sorted(corr_pairs, key=lambda x: abs(x['value']), reverse=True)[:20]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/analytics/risk-segments')
async def risk_segments():
    try:
        df = get_dataset()
        segments = df.groupby('risk_category').agg({
            'attendance': 'mean',
            'internal_marks': 'mean',
            'assignment_completion': 'mean',
            'study_hours': 'mean',
            'previous_gpa': 'mean',
            'participation_score': 'mean',
        }).round(2).reset_index()

        return {
            'success': True,
            'data': segments.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/analytics/student/{student_id}')
async def student_tracking(student_id: str):
    try:
        df = get_dataset()
        sid_upper = student_id.upper()
        if not sid_upper.startswith('STU-'):
            sid_upper = f'STU-{sid_upper}'

        match = df[df['student_id'].str.upper() == sid_upper]
        if match.empty:
            try:
                row_idx = int(student_id)
                if 0 <= row_idx < len(df):
                    match = df.iloc[[row_idx]]
                else:
                    raise ValueError
            except ValueError:
                raise HTTPException(status_code=404, detail=f'Student "{student_id}" not found. Use STU-XXXX format (e.g., STU-0042)')

        student = match.iloc[0].to_dict()
        student = {k: int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v for k, v in student.items()}

        from ..utils.model_loader import predict_student
        data = {k: float(student[k]) for k in FEATURES}
        prediction = predict_student(data)

        seed = hash(student.get('student_id', student_id)) % (2**31)
        np.random.seed(seed)
        base = {
            'attendance': student['attendance'],
            'internal_marks': student['internal_marks'],
            'study_hours': student['study_hours'],
        }
        weeks = 8
        trend = []
        for w in range(weeks):
            trend.append({
                'week': f'W{w+1}',
                'attendance': max(0, min(100, base['attendance'] + int(np.random.normal(0, 5)))),
                'marks': max(0, min(100, base['internal_marks'] + int(np.random.normal(0, 4)))),
                'study_hours': max(0.5, min(12, round(base['study_hours'] + float(np.random.normal(0, 0.8)), 1))),
            })

        return {
            'success': True,
            'data': {
                'student': student,
                'prediction': prediction,
                'weekly_trend': trend,
                'risk_category': student.get('risk_category', prediction['risk_level']),
                'pass_status': int(student.get('pass_status', 1 if prediction['pass_prediction'] == 'Pass' else 0))
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/analytics/period')
async def analytics_period(period: str = Query('monthly', pattern='^(monthly|quarterly|half_yearly|yearly)$')):
    try:
        df = get_dataset()
        total = len(df)
        periods_map = {
            'monthly': 12,
            'quarterly': 4,
            'half_yearly': 2,
            'yearly': 1,
        }
        num_periods = periods_map[period]
        chunk_size = max(1, total // num_periods)
        labels_map = {
            'monthly': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            'quarterly': ['Q1','Q2','Q3','Q4'],
            'half_yearly': ['H1','H2'],
            'yearly': ['YTD'],
        }
        labels = labels_map[period]
        results = []
        for i in range(num_periods):
            start = i * chunk_size
            end = total if i == num_periods - 1 else (i + 1) * chunk_size
            chunk = df.iloc[start:end]
            cp = int(chunk['pass_status'].sum())
            cf = len(chunk) - cp
            cr = round(cp / len(chunk) * 100, 1) if len(chunk) > 0 else 0
            avg_att = round(float(chunk['attendance'].mean()), 1)
            avg_gpa = round(float(chunk['previous_gpa'].mean()), 2)
            results.append({
                'label': labels[i] if i < len(labels) else f'P{i+1}',
                'pass_count': cp,
                'fail_count': cf,
                'pass_rate': cr,
                'avg_attendance': avg_att,
                'avg_gpa': avg_gpa,
                'students': len(chunk),
            })
        return {'success': True, 'data': {'period': period, 'segments': results}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
