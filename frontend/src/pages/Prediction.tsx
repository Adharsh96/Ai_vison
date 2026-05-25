import { useState, useRef, type KeyboardEvent } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { predictStudent } from '../api/client'

interface TutorAlert {
  type: string
  severity: string
  action: string
}

interface PredictionResult {
  pass_prediction: string
  risk_level: string
  probability_pass: number
  probability_fail: number
  academic_category: string
  recommendations: string[]
  tutor_alerts: TutorAlert[]
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const sliderFields = [
  { key: 'attendance', label: 'Attendance', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'study_hours', label: 'Study Hours', min: 0, max: 12, step: 0.5, unit: 'h' },
  { key: 'assignment_completion', label: 'Assignment Completion', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'internal_marks', label: 'Internal Marks', min: 0, max: 100, step: 1, unit: '' },
  { key: 'previous_gpa', label: 'Previous GPA', min: 0, max: 10, step: 0.1, unit: '' },
  { key: 'participation_score', label: 'Participation Score', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'sleep_hours', label: 'Sleep Hours', min: 0, max: 12, step: 0.5, unit: 'h' },
]

const toggleFields = [
  { key: 'internet_access', label: 'Internet Access' },
  { key: 'family_support', label: 'Family Support' },
  { key: 'extra_curricular', label: 'Extra-curricular' },
]

const riskColors: Record<string, string> = {
  'Low Risk': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Medium Risk': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'High Risk': 'bg-red-500/20 text-red-400 border-red-500/30',
}

const severityColors: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
}

function generateRandomFormData() {
  const data: Record<string, number> = {}
  sliderFields.forEach(f => { data[f.key] = parseFloat((f.min + Math.random() * (f.max - f.min)).toFixed(f.step < 1 ? 1 : 0)) })
  toggleFields.forEach(f => { data[f.key] = Math.round(Math.random()) })
  return data
}

function SliderField({ label, value, onChange, min, max, step, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-300 font-medium">{label}</label>
        <span className="text-sm font-mono text-amber-400 font-semibold tabular-nums">{value}{unit}</span>
      </div>
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700 accent-amber-500"
          style={{ background: `linear-gradient(to right, #f97316 ${pct}%, #374151 ${pct}%)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function ToggleField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-300 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${value ? 'text-amber-400' : 'text-gray-500'}`}>{value ? 'Yes' : 'No'}</span>
        <button type="button" onClick={() => onChange(value ? 0 : 1)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-amber-500' : 'bg-gray-600'}`}>
          <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
        </button>
      </div>
    </div>
  )
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="dark-panel p-5 space-y-3">
      <div className="skeleton h-5 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  )
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Prediction() {
  const navigate = useNavigate()
  const initialRef = useRef(generateRandomFormData())
  const [formData, setFormData] = useState<Record<string, number>>(initialRef.current)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: string, value: number) => {
    setFormData((prev: Record<string, number>) => ({ ...prev, [key]: value }))
  }

  const handleRandomize = () => { setFormData(generateRandomFormData()) }

  const handleSubmit = async () => {
    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const response: PredictionResult = await predictStudent(formData)
      setResult(response)
      setStatus('success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Prediction failed. Please try again.'
      setError(message)
      setStatus('error')
    }
  }

  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && status !== 'loading') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]" onKeyDown={keyDownHandler}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="gradient-text">Prediction Playground</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Adjust student parameters in real-time and instantly see how they affect academic outcomes.
            Toggle sliders to explore what drives student success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="dark-panel p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Student Profile
                </h2>
                <button type="button" onClick={handleRandomize}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-amber-300 hover:bg-white/10 border border-white/10 transition-all">
                  Randomize
                </button>
              </div>

              <div className="space-y-5 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
                {sliderFields.map(field => (
                  <SliderField key={field.key} label={field.label} min={field.min} max={field.max}
                    step={field.step} unit={field.unit} value={formData[field.key] ?? field.min}
                    onChange={v => updateField(field.key, v)} />
                ))}

                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Binary Factors</p>
                  {toggleFields.map(field => (
                    <ToggleField key={field.key} label={field.label} value={formData[field.key] ?? 0}
                      onChange={v => updateField(field.key, v)} />
                  ))}
                </div>
              </div>

              <motion.button type="button" onClick={handleSubmit} disabled={status === 'loading'}
                whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                className={`mt-6 w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  status === 'loading'
                    ? 'bg-amber-500/50 text-white/70 cursor-not-allowed'
                    : 'accent-gradient text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                }`}>
                {status === 'loading' ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Predicting...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Run Prediction</>
                )}
              </motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="empty" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
                  className="dark-panel p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <motion.div variants={itemVariants} className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  </motion.div>
                  <motion.h3 variants={itemVariants} className="text-xl font-semibold text-white mb-2">Ready to Predict</motion.h3>
                  <motion.p variants={itemVariants} className="text-gray-400 text-sm max-w-sm">
                    Adjust the student parameters on the left, then click <span className="text-amber-400 font-medium">Run Prediction</span> to see AI-powered results.
                  </motion.p>
                </motion.div>
              )}

              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <SkeletonCard lines={2} /><SkeletonCard lines={4} /><SkeletonCard lines={3} />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="dark-panel p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prediction Failed</h3>
                  <p className="text-gray-400 text-sm mb-5 max-w-sm">{error}</p>
                  <button type="button" onClick={handleSubmit}
                    className="px-5 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 border border-red-500/20 transition-all">Retry</button>
                </motion.div>
              )}

              {status === 'success' && result && (
                <motion.div key="result" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk Level</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${riskColors[result.risk_level] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                          <span className={`w-2 h-2 rounded-full ${
                            result.risk_level === 'Low Risk' ? 'bg-emerald-400' :
                            result.risk_level === 'Medium Risk' ? 'bg-amber-400' :
                            result.risk_level === 'High Risk' ? 'bg-red-400' : 'bg-gray-400'
                          }`} />
                          {result.risk_level || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prediction</p>
                        <span className={`text-2xl sm:text-3xl font-bold ${result.pass_prediction === 'Pass' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {result.pass_prediction === 'Pass' ? '✓' : '✗'} {result.pass_prediction || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Probability Score</p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-xs text-gray-500">Fail</span>
                      <motion.span key={result.probability_pass}
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                        {(result.probability_pass * 100).toFixed(0)}%
                      </motion.span>
                      <span className="text-xs text-gray-500">Pass</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-700 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.probability_pass * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full rounded-full ${result.probability_pass >= 0.7
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : result.probability_pass >= 0.4
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-red-500 to-red-400'}`} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-gray-600">0%</span>
                      <span className="text-xs text-gray-600">100%</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Academic Category</p>
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
                      {result.academic_category || 'N/A'}
                    </span>
                  </motion.div>

                  {result.recommendations && result.recommendations.length > 0 && (
                    <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Intervention Recommendations
                      </p>
                      <ul className="space-y-2">
                        {result.recommendations.map((item: string, i: number) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-2.5 text-sm text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {result.tutor_alerts && result.tutor_alerts.length > 0 && (
                    <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Tutor Alerts
                      </p>
                      <div className="space-y-2.5">
                        {result.tutor_alerts.map((alert: TutorAlert, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                              severityColors[alert.severity] || 'bg-gray-500/20 text-gray-400'
                            }`}>{alert.severity || 'info'}</span>
                            <span className="text-sm text-gray-300 flex-1">{alert.action}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="flex gap-3 pt-1">
                    <button type="button" onClick={handleRandomize}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
                      Try Different Profile
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-sm text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                      View Dashboard
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
