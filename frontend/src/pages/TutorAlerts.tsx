import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getStudents, predictStudent } from '../api/client'

interface Alert {
  id: string
  type: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  severityColor: string
  studentId: string
  message: string
  recommendedAction: string
  mentoringPlan: string
  metrics: Record<string, number>
}

export default function TutorAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('All')

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    try {
      setLoading(true)
      const data: any = await getStudents({ page: 1, per_page: 50 })
      const records: any[] = data.records || data.students || []
      const generated: Alert[] = []

      for (const student of records) {
        const sid = student.student_id || `STU-${String(student.id).padStart(4, '0')}`
        const { attendance = 0, study_hours = 0, assignment_completion = 0, internal_marks = 0, previous_gpa = 0, participation_score = 0 } = student

        if (attendance < 40) {
          generated.push({
            id: `critical-${sid}`, type: 'Critical Risk', severity: 'Critical', severityColor: 'red',
            studentId: sid,
            message: `${sid}: critically low attendance (${attendance}%) — high dropout risk.`,
            recommendedAction: 'Immediate counselor intervention required. Schedule parent-teacher meeting.',
            mentoringPlan: 'Daily attendance monitoring, check-in every morning, weekly progress review.',
            metrics: { attendance, study_hours, internal_marks, previous_gpa },
          })
        }

        if (attendance >= 40 && attendance < 60) {
          generated.push({
            id: `attendance-${sid}`, type: 'Attendance Alert', severity: 'High', severityColor: 'orange',
            studentId: sid,
            message: `${sid}: frequent absence (${attendance}% attendance).`,
            recommendedAction: 'Send attendance warning notice. Implement attendance improvement plan.',
            mentoringPlan: 'Bi-weekly attendance tracking, peer buddy system, reward improvement milestones.',
            metrics: { attendance, study_hours, assignment_completion, internal_marks },
          })
        }

        if (study_hours < 3 && attendance < 70) {
          generated.push({
            id: `study-${sid}`, type: 'Low Study Hours', severity: 'Medium', severityColor: 'yellow',
            studentId: sid,
            message: `${sid}: studies only ${study_hours}h/day — below recommended minimum.`,
            recommendedAction: 'Connect with academic support services. Suggest study groups.',
            mentoringPlan: 'Structured study schedule creation, time management workshop, weekly check-ins.',
            metrics: { study_hours, attendance, previous_gpa },
          })
        }

        if (assignment_completion < 50) {
          generated.push({
            id: `assign-${sid}`, type: 'Assignment Neglect', severity: 'Critical', severityColor: 'red',
            studentId: sid,
            message: `${sid}: completed only ${assignment_completion}% of assignments.`,
            recommendedAction: 'Immediate academic probation review. Assignment catch-up plan required.',
            mentoringPlan: 'Daily assignment tracking, extended deadlines with milestones, tutor assistance.',
            metrics: { assignment_completion, internal_marks, attendance },
          })
        }

        if (internal_marks < 40 && previous_gpa < 2.5) {
          generated.push({
            id: `decline-${sid}`, type: 'Academic Decline', severity: 'Critical', severityColor: 'red',
            studentId: sid,
            message: `${sid}: consistent academic decline (marks: ${internal_marks}, GPA: ${previous_gpa}).`,
            recommendedAction: 'Comprehensive academic assessment. Remedial class enrollment.',
            mentoringPlan: 'Weekly tutoring sessions, concept reinforcement, practice tests with feedback.',
            metrics: { internal_marks, previous_gpa, attendance, study_hours },
          })
        }

        if (participation_score < 30 && attendance < 60) {
          generated.push({
            id: `participation-${sid}`, type: 'Low Participation', severity: 'Low', severityColor: 'gray',
            studentId: sid,
            message: `${sid}: minimal academic engagement (${participation_score}% participation, ${attendance}% attendance).`,
            recommendedAction: 'Engagement survey and motivation assessment. Extracurricular involvement.',
            mentoringPlan: 'Interest-based learning activities, goal-setting sessions, recognition program.',
            metrics: { participation_score, attendance, study_hours },
          })
        }
      }

      setAlerts(generated)
    } catch (err: any) {
      setError(err?.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = filter === 'All'
    ? alerts
    : alerts.filter(a => {
        if (filter === 'High') return a.severity === 'Critical' || a.severity === 'High'
        if (filter === 'Medium') return a.severity === 'Medium'
        if (filter === 'Low') return a.severity === 'Low'
        return true
      })

  const severityBadge = (severity: string, color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-50 text-red-700 border-red-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    const indicators: Record<string, string> = {
      red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-yellow-500', gray: 'bg-gray-400',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.gray}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${indicators[color] || indicators.gray}`} />
        {severity}
      </span>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">Tutor Alerts</h1>
          </div>
          <p className="text-gray-500 text-lg ml-[52px]">
            AI-generated alerts from real student records identifying who needs academic intervention.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8">
          {['All', 'High', 'Medium', 'Low'].map(level => (
            <button key={level} onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === level
                  ? 'bg-[#1a1a2e] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              {level}
              {level === 'All' && <span className="ml-1.5 text-xs opacity-70">({alerts.length})</span>}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="space-y-2 flex-1"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div>
                </div>
                <div className="skeleton h-12 w-full" /><div className="skeleton h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAlerts.map(alert => (
              <motion.div key={alert.id} variants={item} className="glass-card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1a1a2e]">{alert.type}</h3>
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{alert.studentId}</span>
                    </div>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                  </div>
                  {severityBadge(alert.severity, alert.severityColor)}
                </div>

                <div className="space-y-3">
                  <div className="bg-amber-50/50 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Recommended Action</p>
                    <p className="text-sm text-[#1a1a2e]">{alert.recommendedAction}</p>
                  </div>
                  <div className="bg-[#1a1a2e]/5 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Suggested Mentoring Plan</p>
                    <p className="text-sm text-[#1a1a2e]">{alert.mentoringPlan}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(alert.metrics).map(([key, val]) => (
                    <span key={key} className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-600 font-mono">
                      {key.replace(/_/g, ' ')}: {val}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-12 h-12 mx-auto">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <p className="text-gray-400 mt-4">No alerts match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
