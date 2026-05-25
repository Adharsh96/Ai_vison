from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction import router as prediction_router
from app.routes.analytics import router as analytics_router
from app.routes.dataset_route import router as dataset_router
from app.routes.model_metrics import router as model_metrics_router

app = FastAPI(
    title='Academic Risk Intelligence Platform',
    description='AI-powered Student Performance Prediction System',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(prediction_router)
app.include_router(analytics_router)
app.include_router(dataset_router)
app.include_router(model_metrics_router)

@app.get('/')
async def root():
    return {'message': 'Academic Risk Intelligence Platform API', 'version': '1.0.0', 'status': 'running'}

@app.get('/health')
async def health():
    return {'status': 'healthy'}
