from fastapi import APIRouter, HTTPException, Query, UploadFile, File
import pandas as pd
import numpy as np
import os
import io
import json

router = APIRouter(prefix='/api', tags=['Dataset'])

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

@router.get('/dataset/summary')
async def dataset_summary():
    try:
        df = get_dataset()
        return {
            'success': True,
            'data': {
                'total_records': len(df),
                'columns': list(df.columns),
                'risk_counts': df['risk_category'].value_counts().to_dict(),
                'pass_ratio': {
                    'pass': int(df['pass_status'].sum()),
                    'fail': int((1 - df['pass_status']).sum())
                },
                'missing_values': df.isnull().sum().to_dict(),
                'stats': df.describe().to_dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/dataset/students')
async def get_students(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_filter: str = Query(None, pattern='^(Low Risk|Medium Risk|High Risk)?$'),
    search: str = Query(None)
):
    try:
        df = get_dataset()
        df = df.reset_index().rename(columns={'index': 'id'})
        df['id'] = df.index

        if risk_filter and risk_filter != 'All':
            df = df[df['risk_category'] == risk_filter]
        if search:
            mask = df.astype(str).apply(lambda x: x.str.contains(search, case=False)).any(axis=1)
            df = df[mask]

        total = len(df)
        total_pages = max(1, (total + per_page - 1) // per_page)
        start = (page - 1) * per_page
        end = start + per_page
        records = df.iloc[start:end].to_dict(orient='records')

        return {
            'success': True,
            'data': {
                'records': records,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/dataset/random-student')
async def random_student():
    try:
        df = get_dataset()
        student = df.sample(1).iloc[0].to_dict()
        student = {k: int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v for k, v in student.items()}
        return {'success': True, 'data': student}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

REQUIRED_COLS = ['attendance', 'study_hours', 'assignment_completion', 'internal_marks',
                 'previous_gpa', 'participation_score', 'sleep_hours', 'internet_access',
                 'family_support', 'extra_curricular']

@router.post('/dataset/upload')
async def upload_dataset(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail='Only CSV files are supported')

        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        missing_cols = [c for c in REQUIRED_COLS if c not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f'Missing required columns: {", ".join(missing_cols)}. Required: {", ".join(REQUIRED_COLS)}'
            )

        from ..utils.model_loader import predict_student
        predictions = []
        for _, row in df.iterrows():
            try:
                data = {k: float(row[k]) for k in REQUIRED_COLS}
                sid = str(row.get('student_id', '')) or f'Row {int(_) + 1}'
                result = predict_student(data)
                predictions.append({
                    'row': int(_) + 1,
                    'student_id': sid,
                    'input': {k: float(row[k]) for k in REQUIRED_COLS},
                    'prediction': result
                })
            except Exception as e:
                predictions.append({
                    'row': int(_) + 1,
                    'student_id': str(row.get('student_id', '')) or f'Row {int(_) + 1}',
                    'input': {k: float(row[k]) for k in REQUIRED_COLS},
                    'error': str(e)
                })

        return {
            'success': True,
            'data': {
                'total_rows': len(df),
                'processed': len(predictions),
                'results': predictions[:100],
                'columns': list(df.columns)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
