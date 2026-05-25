import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { getModelMetrics } from '../api/client'

interface Metrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  confusion_matrix?: number[][]
  cv_scores?: number[]
  train_accuracy?: number
  val_accuracy?: number
  model_type?: string
  criterion?: string
  dataset_size?: number
  [key: string]: unknown
}

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 60
    const increment = end / duration
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end])

  return <>{count}{suffix}</>
}

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    try {
      setLoading(true)
      const data = await getModelMetrics()
      setMetrics(data)
    } catch {
      setError('Failed to load model metrics')
    } finally {
      setLoading(false)
    }
  }

  const metricCards = [
    { label: 'Accuracy', value: metrics?.accuracy ?? 0, color: 'from-[#f97316] to-[#fb923c]' },
    { label: 'Precision', value: metrics?.precision ?? 0, color: 'from-[#f97316] to-[#fdba74]' },
    { label: 'Recall', value: metrics?.recall ?? 0, color: 'from-[#fb923c] to-[#f97316]' },
    { label: 'F1 Score', value: metrics?.f1_score ?? 0, color: 'from-[#fdba74] to-[#f97316]' },
  ]

  const confusionMatrix = metrics?.confusion_matrix
  const hasConfusionMatrix = confusionMatrix && confusionMatrix.length >= 2

  const cvScores = metrics?.cv_scores
  const cvChartData = cvScores
    ? cvScores.map((score: number, i: number) => ({ fold: `Fold ${i + 1}`, score: +(score * 100).toFixed(1) }))
    : []

  const modelType = metrics?.model_type || 'Decision Tree'
  const criterion = metrics?.criterion || 'entropy'
  const datasetSize = metrics?.dataset_size || 758

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">Model Performance</h1>
          </div>
          <p className="text-gray-500 text-lg ml-[52px]">
            Evaluation metrics, confusion matrix, and cross-validation performance of the trained model.
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

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="dark-panel p-6 space-y-3">
                  <div className="skeleton h-4 w-20 bg-white/10" />
                  <div className="skeleton h-10 w-24 bg-white/10" />
                </div>
              ))}
            </div>
            <div className="glass-card p-6 space-y-4">
              <div className="skeleton h-6 w-40" />
              <div className="grid grid-cols-2 gap-4">
                <div className="skeleton h-32" />
                <div className="skeleton h-32" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            >
              {metricCards.map((card, i) => (
                <div key={i} className="dark-panel p-5 sm:p-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{card.label}</p>
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                    className="text-3xl sm:text-4xl font-bold"
                  >
                    <span className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                      <AnimatedCounter end={Math.round((card.value ?? 0) * 100)} suffix="%" />
                    </span>
                  </motion.p>
                </div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {hasConfusionMatrix && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Confusion Matrix</h2>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    {[
                      { label: 'TN', value: confusionMatrix![0][0], color: 'bg-green-100 text-green-800' },
                      { label: 'FP', value: confusionMatrix![0][1], color: 'bg-red-100 text-red-800' },
                      { label: 'FN', value: confusionMatrix![1][0], color: 'bg-red-100 text-red-800' },
                      { label: 'TP', value: confusionMatrix![1][1], color: 'bg-green-100 text-green-800' },
                    ].map((cell, i) => (
                      <div
                        key={i}
                        className={`${cell.color} rounded-xl p-4 sm:p-6 text-center transition-transform hover:scale-105`}
                      >
                        <p className="text-xs font-medium opacity-70 mb-1">{cell.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold">{cell.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                    <span>← Predicted →</span>
                  </div>
                </motion.div>
              )}

              {cvChartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Cross-Validation Scores</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={cvChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="fold" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" unit="%" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '13px',
                        }}
                        formatter={(value: unknown) => [`${value}%`, 'Accuracy']}
                      />
                      <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Training vs Test Accuracy</h2>
                {metrics?.train_accuracy != null || metrics?.accuracy != null ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Training Accuracy</span>
                        <span className="font-mono font-medium text-[#1a1a2e]">
                          {((metrics?.train_accuracy ?? 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(metrics?.train_accuracy ?? 0) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Test Accuracy</span>
                        <span className="font-mono font-medium text-[#1a1a2e]">
                          {((metrics?.accuracy ?? 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(metrics?.accuracy ?? 0) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#fdba74] to-[#f97316]"
                        />
                      </div>
                    </div>
                    {metrics?.train_accuracy != null && metrics?.accuracy != null && (
                      <div className="flex gap-2 items-center pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                          Train: {((metrics.train_accuracy) * 100).toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#fdba74]" />
                          Test: {((metrics.accuracy) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No training/validation data available.</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Model Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Model Type</span>
                    <span className="text-sm font-medium text-[#1a1a2e]">{modelType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Criterion</span>
                    <span className="text-sm font-medium text-[#1a1a2e]">{criterion}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Dataset Size</span>
                    <span className="text-sm font-medium text-[#1a1a2e]">{datasetSize.toLocaleString()} records</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Features</span>
                    <span className="text-sm font-medium text-[#1a1a2e]">6 (attendance, study_hours, assignments, marks, gpa, ...)</span>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 mt-2">
                    <p className="text-xs font-medium text-[#f97316] mb-1">Why Decision Tree?</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Decision Trees provide interpretable rules for risk classification, handle mixed data types well, 
                      require minimal preprocessing, and offer transparent decision paths that educators can understand 
                      and act upon without machine learning expertise.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
