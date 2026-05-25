import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { getFeatureImportance, getDecisionPath, predictStudent } from '../api/client'

interface FeatureImportance {
  feature: string
  importance: number
}

interface DecisionStep {
  condition?: string
  result?: string
  detail?: string
  feature?: string
  threshold?: number
  value?: number
  direction?: string
  type?: string
  decision?: string
  node?: number
}

interface PredictionResponse {
  risk_level?: string
  risk_category?: string
  risk_category_display?: string
  risk_score?: number
  prediction?: string
  class?: string
  probability?: number
  probability_pass?: number
  pass_prediction?: string
  recommendations?: string[]
  tutor_alerts?: { type: string; severity: string; action: string }[]
  [key: string]: unknown
}

const fields: { key: string; label: string; min: number; max: number; step?: number }[] = [
  { key: 'attendance', label: 'Attendance', min: 0, max: 100 },
  { key: 'study_hours', label: 'Study Hours / Day', min: 0, max: 12, step: 0.5 },
  { key: 'assignment_completion', label: 'Assignment Completion', min: 0, max: 100 },
  { key: 'internal_marks', label: 'Internal Marks', min: 0, max: 100 },
  { key: 'previous_gpa', label: 'Previous GPA', min: 0, max: 10, step: 0.1 },
  { key: 'participation_score', label: 'Participation Score', min: 0, max: 100 },
  { key: 'sleep_hours', label: 'Sleep Hours', min: 0, max: 12, step: 0.5 },
  { key: 'internet_access', label: 'Internet Access', min: 0, max: 1 },
  { key: 'family_support', label: 'Family Support', min: 0, max: 1 },
  { key: 'extra_curricular', label: 'Extra Curricular', min: 0, max: 1 },
]

const defaultForm: Record<string, number> = {
  attendance: 75, study_hours: 4, assignment_completion: 70, internal_marks: 65,
  previous_gpa: 6.0, participation_score: 60, sleep_hours: 7,
  internet_access: 1, family_support: 1, extra_curricular: 1,
}

export default function ExplainableAI() {
  const [features, setFeatures] = useState<FeatureImportance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Record<string, number>>({ ...defaultForm })
  const [predicting, setPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)
  const [decisionPath, setDecisionPath] = useState<DecisionStep[]>([])

  useEffect(() => {
    loadFeatures()
  }, [])

  async function loadFeatures() {
    try {
      setLoading(true)
      const data = await getFeatureImportance()
      setFeatures(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load feature importance data')
    } finally {
      setLoading(false)
    }
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault()
    try {
      setPredicting(true)
      setError('')
      setPredictionResult(null)
      setDecisionPath([])
      const [prediction, path] = await Promise.all([
        predictStudent(formData),
        getDecisionPath(formData)
      ])
      setPredictionResult(prediction as PredictionResponse)
      const steps = path.steps || path.path || (path.step ? [path] : [])
      setDecisionPath(Array.isArray(steps) ? steps : [])
    } catch {
      setError('Prediction failed. Please try again.')
    } finally {
      setPredicting(false)
    }
  }

  const riskCategory = predictionResult?.risk_level
    || predictionResult?.risk_category_display
    || predictionResult?.risk_category
    || ''

  const riskScore = predictionResult?.probability_pass ?? predictionResult?.probability ?? null

  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance)

  const explanationItems: { feature: string; value: number; threshold: number; condition: string }[] = []
  if (formData.attendance < 60) explanationItems.push({ feature: 'Attendance', value: formData.attendance, threshold: 60, condition: 'below' })
  if (formData.study_hours < 3) explanationItems.push({ feature: 'Study Hours', value: formData.study_hours, threshold: 3, condition: 'below' })
  if (formData.internal_marks < 50) explanationItems.push({ feature: 'Internal Marks', value: formData.internal_marks, threshold: 50, condition: 'below' })
  if (formData.assignment_completion < 50) explanationItems.push({ feature: 'Assignment Completion', value: formData.assignment_completion, threshold: 50, condition: 'below' })
  if (formData.previous_gpa < 5) explanationItems.push({ feature: 'Previous GPA', value: formData.previous_gpa, threshold: 5, condition: 'below' })
  if (formData.participation_score < 40) explanationItems.push({ feature: 'Participation', value: formData.participation_score, threshold: 40, condition: 'below' })
  if (formData.sleep_hours < 5) explanationItems.push({ feature: 'Sleep Hours', value: formData.sleep_hours, threshold: 5, condition: 'below' })

  const isLowRisk = explanationItems.length === 0

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">Explainable AI</h1>
          </div>
          <p className="text-gray-500 text-lg mb-10 ml-[52px]">
            Understand how the model makes its predictions — transparent, interpretable, and actionable.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Feature Importance</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-6 w-full" />
                ))}
              </div>
            ) : sortedFeatures.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, sortedFeatures.length * 40)}>
                <BarChart data={sortedFeatures} layout="vertical" margin={{ left: 130, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 1]} />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                    formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, 'Importance']}
                  />
                  <Bar dataKey="importance" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm">No feature importance data available.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Try It — Predict a Student</h2>
            <form onSubmit={handlePredict} className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
                  <div className="flex items-center gap-3">
                    {f.key === 'internet_access' || f.key === 'family_support' || f.key === 'extra_curricular' ? (
                      <select
                        value={formData[f.key]}
                        onChange={e => setFormData(prev => ({ ...prev, [f.key]: parseInt(e.target.value) }))}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    ) : (
                      <>
                        <input
                          type="range"
                          min={f.min}
                          max={f.max}
                          step={f.step || 1}
                          value={formData[f.key]}
                          onChange={e => setFormData(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-semibold text-[#1a1a2e] w-12 text-right whitespace-nowrap">
                          {f.key === 'previous_gpa' ? formData[f.key].toFixed(1) : formData[f.key]}
                          {f.key === 'attendance' && '%'}
                          {f.key === 'study_hours' && 'h'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={predicting}
                className="w-full py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {predicting ? 'Analyzing...' : 'Generate Explanation'}
              </button>
            </form>
          </motion.div>
        </div>

        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="dark-panel p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Prediction Result</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#f97316]">{riskCategory || 'Unknown'}</span>
                {riskScore !== null && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-gray-300">
                    Pass Confidence: {(riskScore * 100).toFixed(1)}%
                  </span>
                )}
                {predictionResult.pass_prediction && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    predictionResult.pass_prediction === 'Pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {predictionResult.pass_prediction}
                  </span>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                <p className="text-gray-300 leading-relaxed">
                  {isLowRisk
                    ? 'The student shows satisfactory academic indicators across all monitored features. No significant risk factors detected.'
                    : `The student is classified as ${riskCategory} because: ${explanationItems.map(e => `${e.feature} is ${e.value}${e.feature === 'Attendance' || e.feature === 'Internal Marks' || e.feature === 'Assignment Completion' || e.feature === 'Participation' ? '%' : ''} (${e.condition} ${e.threshold}${e.feature === 'Attendance' || e.feature === 'Internal Marks' || e.feature === 'Assignment Completion' || e.feature === 'Participation' ? '%' : ''})`).join('; ')}.`
                  }
                  {' '}Intervention may be recommended if risk factors persist.
                </p>
              </div>
              {predictionResult.recommendations && predictionResult.recommendations.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {predictionResult.recommendations.slice(0, 4).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {decisionPath.length > 0 && (
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                  <h2 className="text-lg font-semibold text-[#1a1a2e]">Decision Path</h2>
                </div>
                <div className="space-y-0">
                  {decisionPath.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="relative flex items-start gap-4 pb-2"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        {i < decisionPath.length - 1 && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-[#f97316] to-transparent mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-[#1a1a2e] text-sm">
                          {step.decision || step.condition || step.feature || `Step ${i + 1}`}
                        </p>
                        {step.detail && (
                          <p className="text-gray-400 text-xs mt-0.5">{step.detail}</p>
                        )}
                        {step.type === 'leaf' && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                            → {step.value === 1 ? 'Pass' : 'Fail'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <h2 className="text-lg font-semibold text-[#1a1a2e]">Feature Weights</h2>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500">Feature</th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-500">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFeatures.map((f, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-2.5 text-[#1a1a2e]">{f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-[#f97316]">
                            {(f.importance * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  <h2 className="text-lg font-semibold text-[#1a1a2e]">Risk Contribution</h2>
                </div>
                <div className="space-y-4">
                  {sortedFeatures.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                        <span className="font-mono text-[#1a1a2e] font-medium">
                          {(f.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.importance * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!predictionResult && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className="w-8 h-8">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Adjust the sliders above and click <strong>Generate Explanation</strong> to see the model's decision path and feature importance breakdown for a specific student profile.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}