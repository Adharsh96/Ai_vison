import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts'
import {
  getAnalyticsOverview,
  getAnalyticsDistributions,
  getAnalyticsCorrelations,
  getRiskSegments,
  getStudentTracking,
  getAnalyticsPeriod,
} from '../api/client'

const COLORS = {
  pass: '#22c55e',
  fail: '#ef4444',
  orange: '#f97316',
  grid: '#374151',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function SkeletonCard() {
  return (
    <div className="dark-panel p-6 space-y-4">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-20" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="dark-panel p-6 space-y-4">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-64 w-full" />
    </div>
  )
}

function OverviewCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <motion.div variants={itemVariants} className="dark-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-3xl sm:text-4xl font-bold text-white mt-2">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </motion.div>
  )
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="dark-panel p-6">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h3>
      {children}
    </motion.div>
  )
}

const tooltipStyle = {
  background: '#1a1a2e',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#fff',
}

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [distributions, setDistributions] = useState<any>(null)
  const [correlations, setCorrelations] = useState<any[]>([])
  const [riskSegments, setRiskSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trackId, setTrackId] = useState('')
  const [tracking, setTracking] = useState<any>(null)
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [period, setPeriod] = useState('monthly')
  const [periodData, setPeriodData] = useState<any[]>([])
  const [periodLoading, setPeriodLoading] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true)
        setError(null)
        const [ov, dist, corr, risk, pd] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsDistributions(),
          getAnalyticsCorrelations(),
          getRiskSegments(),
          getAnalyticsPeriod('monthly'),
        ])
        setOverview(ov)
        setDistributions(dist)
        setPeriodData(pd.segments || [])

        const corrArr = Object.entries(corr.target_correlation || {}).map(([k, v]) => ({
          feature: k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          correlation: v as number,
        }))
        setCorrelations(corrArr)

        const riskDist = ov?.risk_distribution || {}
        const riskArr = Object.entries(riskDist).map(([k, v]) => ({
          segment: k,
          count: v as number,
        }))
        setRiskSegments(riskArr)
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const changePeriod = async (p: string) => {
    setPeriod(p)
    setPeriodLoading(true)
    try {
      const pd = await getAnalyticsPeriod(p)
      setPeriodData(pd.segments || [])
    } catch {
      // ignore
    } finally {
      setPeriodLoading(false)
    }
  }

  const handleTrackStudent = async () => {
    const id = trackId.trim()
    if (!id) {
      setTrackError('Enter a student ID (e.g., STU-0042)')
      return
    }
    setTrackLoading(true)
    setTrackError(null)
    setTracking(null)
    try {
      const data = await getStudentTracking(id)
      setTracking(data)
    } catch (err: any) {
      setTrackError(err?.response?.data?.detail || err?.message || 'Student not found')
    } finally {
      setTrackLoading(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="dark-panel p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-7 h-7">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <p className="text-white text-lg font-medium mb-2">Something went wrong</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">Retry</button>
        </motion.div>
      </div>
    )
  }

  const passFailData = overview
    ? [
        { name: 'Pass', value: overview.pass_count },
        { name: 'Fail', value: overview.fail_count },
      ]
    : []

  const behavioralData = [
    { name: 'Attendance', impact: 85 },
    { name: 'Homework', impact: 72 },
    { name: 'Participation', impact: 68 },
    { name: 'Study Hours', impact: 78 },
    { name: 'Previous GPA', impact: 91 },
  ]

  const sortedCorrelations = [...correlations].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive overview of student performance metrics</p>
      </motion.div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonChart key={i} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard title="Total Students" value={overview?.total_students ?? 0} subtitle="Enrolled this semester" />
            <OverviewCard title="Pass Rate" value={overview ? `${overview.pass_rate}%` : '0%'} subtitle="Overall passing students" />
            <OverviewCard title="Avg Attendance" value={overview ? `${overview.averages?.attendance ?? 0}%` : '0%'} subtitle="Average class attendance" />
            <OverviewCard title="Avg GPA" value={overview?.averages?.previous_gpa?.toFixed(2) ?? '0.00'} subtitle="Overall grade point average" />
          </div>

          <motion.div variants={itemVariants} className="dark-panel p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Student Tracker</h3>
                <p className="text-gray-500 text-xs mt-0.5">Look up a student by ID (e.g., STU-0042 or 42) to view their prediction and weekly trend</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input type="text" value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrackStudent()}
                  placeholder="STU-0042"
                  className="flex-1 sm:w-32 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                <button onClick={handleTrackStudent} disabled={trackLoading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {trackLoading ? '...' : 'Track'}
                </button>
              </div>
            </div>

            {trackError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{trackError}</div>
            )}

            {tracking && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Student ID</p>
                    <p className="text-lg font-bold text-white font-mono">{tracking.student?.student_id || tracking.student?.id}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Risk</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${
                      tracking.risk_category === 'Low Risk' ? 'bg-emerald-500/20 text-emerald-400' :
                      tracking.risk_category === 'Medium Risk' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{tracking.risk_category}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Prediction</p>
                    <p className={`text-lg font-bold ${tracking.prediction?.pass_prediction === 'Pass' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tracking.prediction?.pass_prediction}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-lg font-bold text-amber-400">{(tracking.prediction?.probability_pass * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {tracking.weekly_trend && tracking.weekly_trend.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Weekly Progress Trend</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={tracking.weekly_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} />
                        <YAxis stroke="#9ca3af" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                        <Line type="monotone" dataKey="attendance" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} name="Attendance" />
                        <Line type="monotone" dataKey="marks" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Marks" />
                        <Line type="monotone" dataKey="study_hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Study Hrs" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            )}

            {!tracking && !trackError && (
              <div className="text-center py-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-8 h-8 mx-auto">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                <p className="text-gray-500 text-xs mt-2">Enter a student ID and click Track</p>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPanel title="Pass vs Fail Ratio">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={passFailData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" animationBegin={200} animationDuration={1000}>
                    {passFailData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === 'Pass' ? COLORS.pass : COLORS.fail} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS.pass }} />
                  <span className="text-gray-400 text-sm">Pass ({passFailData[0]?.value ?? 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS.fail }} />
                  <span className="text-gray-400 text-sm">Fail ({passFailData[1]?.value ?? 0})</span>
                </div>
              </div>
            </ChartPanel>

            <ChartPanel title="Attendance Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributions?.attendance ?? []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={COLORS.orange} radius={[4, 4, 0, 0]} animationBegin={300} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="GPA Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributions?.gpa ?? []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} animationBegin={400} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Risk Segmentation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskSegments} layout="vertical" barSize={24} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="segment" stroke="#9ca3af" fontSize={12} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} animationBegin={500} animationDuration={1000}>
                    {riskSegments.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? COLORS.fail : index === riskSegments.length - 1 ? COLORS.pass : COLORS.orange} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title={period === 'monthly' ? 'Monthly Performance Trends' : period === 'quarterly' ? 'Quarterly Performance Trends' : period === 'half_yearly' ? 'Half-Yearly Performance Trends' : 'Yearly Performance Trends'}>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'quarterly', label: 'Quarterly' },
                  { key: 'half_yearly', label: 'Half-Yearly' },
                  { key: 'yearly', label: 'Yearly' },
                ].map(p => (
                  <button key={p.key} onClick={() => changePeriod(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      period === p.key ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {periodLoading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={periodData}>
                    <defs>
                      <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [`${value}${name === 'pass_rate' ? '%' : ''}`, name === 'pass_rate' ? 'Pass Rate' : name === 'avg_attendance' ? 'Avg Attendance' : name === 'avg_gpa' ? 'Avg GPA' : name]} />
                    <Area type="monotone" dataKey="pass_rate" stroke={COLORS.orange} fill="url(#perfGradient)" strokeWidth={2} name="pass_rate" animationBegin={600} animationDuration={1000} />
                    <Area type="monotone" dataKey="avg_attendance" stroke="#3b82f6" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="avg_attendance" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {periodData.length > 0 && (
                <div className="flex justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-amber-500" />
                    <span className="text-xs text-gray-400">Pass Rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-blue-500" style={{ borderTop: '1.5px dashed #3b82f6', height: 0 }} />
                    <span className="text-xs text-gray-400">Avg Attendance</span>
                  </div>
                </div>
              )}
            </ChartPanel>

            <ChartPanel title="Behavioral Impact on Performance">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behavioralData} layout="vertical" barSize={20} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Impact']} contentStyle={tooltipStyle} />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} animationBegin={700} animationDuration={1000}>
                    {behavioralData.map((_, index) => (
                      <Cell key={index} fill={`#f97316`} fillOpacity={1 - index * 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          {sortedCorrelations.length > 0 && (
            <ChartPanel title="Feature Correlation with Target">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sortedCorrelations} layout="vertical" barSize={18} margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis type="number" domain={[-1, 1]} stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.toFixed(1)} />
                  <YAxis type="category" dataKey="feature" stroke="#9ca3af" fontSize={11} width={110} />
                  <Tooltip formatter={(value: any) => [Number(value).toFixed(3), 'Correlation']} contentStyle={tooltipStyle} />
                  <Bar dataKey="correlation" radius={[0, 4, 4, 0]} animationBegin={800} animationDuration={1000}>
                    {sortedCorrelations.map((_, index) => (
                      <Cell
                        key={index}
                        fill={sortedCorrelations[index].correlation >= 0 ? COLORS.pass : COLORS.fail}
                        fillOpacity={Math.min(0.4 + Math.abs(sortedCorrelations[index].correlation) * 0.6, 1)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          )}
        </>
      )}
    </motion.div>
  )
}
