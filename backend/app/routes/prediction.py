from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from ..utils.model_loader import predict_student, get_feature_importance, get_decision_path

router = APIRouter(prefix='/api', tags=['Prediction'])

class StudentData(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    study_hours: float = Field(..., ge=0, le=24)
    assignment_completion: float = Field(..., ge=0, le=100)
    internal_marks: float = Field(..., ge=0, le=100)
    previous_gpa: float = Field(..., ge=0, le=10)
    participation_score: float = Field(..., ge=0, le=100)
    sleep_hours: float = Field(..., ge=0, le=24)
    internet_access: int = Field(..., ge=0, le=1)
    family_support: int = Field(..., ge=0, le=1)
    extra_curricular: int = Field(..., ge=0, le=1)

@router.post('/predict')
async def predict(data: StudentData):
    try:
        result = predict_student(data.model_dump())
        return {'success': True, 'data': result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/feature-importance')
async def feature_importance():
    try:
        features = get_feature_importance()
        return {'success': True, 'data': features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/decision-path')
async def decision_path(data: StudentData):
    try:
        path = get_decision_path(data.model_dump())
        return {'success': True, 'data': path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BatchStudentItem(BaseModel):
    student_id: Optional[str] = None
    attendance: float = Field(..., ge=0, le=100)
    study_hours: float = Field(..., ge=0, le=24)
    assignment_completion: float = Field(..., ge=0, le=100)
    internal_marks: float = Field(..., ge=0, le=100)
    previous_gpa: float = Field(..., ge=0, le=10)
    participation_score: float = Field(..., ge=0, le=100)
    sleep_hours: float = Field(..., ge=0, le=24)
    internet_access: int = Field(..., ge=0, le=1)
    family_support: int = Field(..., ge=0, le=1)
    extra_curricular: int = Field(..., ge=0, le=1)

class BatchStudentData(BaseModel):
    students: List[BatchStudentItem]

@router.post('/predict-batch')
async def predict_batch(data: BatchStudentData):
    try:
        results = []
        for i, student in enumerate(data.students):
            try:
                raw = student.model_dump()
                sid = raw.pop('student_id', None) or f'#{i+1}'
                result = predict_student(raw)
                results.append({'index': i, 'student_id': sid, 'success': True, 'data': result})
            except Exception as e:
                results.append({'index': i, 'student_id': getattr(student, 'student_id', None) or f'#{i+1}', 'success': False, 'error': str(e)})
        return {'success': True, 'data': results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
