import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const predictStudent = async (data: Record<string, number>) => {
  const res = await api.post('/predict', data)
  return res.data.data
}

export const getFeatureImportance = async () => {
  const res = await api.get('/feature-importance')
  return res.data.data
}

export const getDecisionPath = async (data: Record<string, number>) => {
  const res = await api.post('/decision-path', data)
  return res.data.data
}

export const getAnalyticsOverview = async () => {
  const res = await api.get('/analytics/overview')
  return res.data.data
}

export const getAnalyticsDistributions = async () => {
  const res = await api.get('/analytics/distributions')
  return res.data.data
}

export const getAnalyticsCorrelations = async () => {
  const res = await api.get('/analytics/correlations')
  return res.data.data
}

export const getRiskSegments = async () => {
  const res = await api.get('/analytics/risk-segments')
  return res.data.data
}

export const getDatasetSummary = async () => {
  const res = await api.get('/dataset/summary')
  return res.data.data
}

export const getStudents = async (params: {
  page?: number
  per_page?: number
  risk_filter?: string
  search?: string
}) => {
  const res = await api.get('/dataset/students', { params })
  return res.data.data
}

export const getRandomStudent = async () => {
  const res = await api.get('/dataset/random-student')
  return res.data.data
}

export const getModelMetrics = async () => {
  const res = await api.get('/model-metrics')
  return res.data.data
}

export const getStudentTracking = async (studentId: number | string) => {
  const res = await api.get(`/analytics/student/${studentId}`)
  return res.data.data
}

export const uploadDataset = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/dataset/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export const predictBatch = async (students: Record<string, number>[]) => {
  const res = await api.post('/predict-batch', { students })
  return res.data.data
}

export const getAnalyticsPeriod = async (period: string = 'monthly') => {
  const res = await api.get('/analytics/period', { params: { period } })
  return res.data.data
}

export default api
