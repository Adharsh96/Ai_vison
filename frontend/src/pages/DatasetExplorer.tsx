import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getDatasetSummary, getStudents, getRandomStudent, uploadDataset, getStudentTracking, predictBatch } from '../api/client'

interface Summary {
  total_records?: number
  total_students?: number
  pass_count?: number
  pass_percentage?: number
  fail_count?: number
  fail_percentage?: number
  missing_values?: number
  features?: string[]
  [key: string]: unknown
}

interface Student {
  id?: number | string
  attendance?: number
  study_hours?: number
  assignment_completion?: number
  internal_marks?: number
  previous_gpa?: number
  risk_category?: string
  risk_score?: number
  [key: string]: unknown
}

interface StudentsResponse {
  students?: Student[]
  records?: Student[]
  total?: number
  page?: number
  per_page?: number
  [key: string]: unknown
}

export default function DatasetExplorer() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [randomStudent, setRandomStudent] = useState<Student | null>(null)
  const [randomLoading, setRandomLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lookupId, setLookupId] = useState('')
  const [lookupResult, setLookupResult] = useState<any>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [manualEntries, setManualEntries] = useState<Record<string, number>[]>([])
  const [manualForm, setManualForm] = useState<Record<string, any>>({
    student_id: '', attendance: 75, study_hours: 4, assignment_completion: 70, internal_marks: 65,
    previous_gpa: 6.0, participation_score: 60, sleep_hours: 7,
    internet_access: 1, family_support: 1, extra_curricular: 1,
  })
  const [batchResults, setBatchResults] = useState<any[] | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const perPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [page, riskFilter])

  async function loadData() {
    try {
      setLoading(true)
      const summaryData = await getDatasetSummary()
      setSummary(summaryData)
    } catch {
      setError('Failed to load dataset summary')
    } finally {
      setLoading(false)
    }
  }

  async function loadStudents() {
    try {
      setTableLoading(true)
      const params: Record<string, string | number> = { page, per_page: perPage }
      if (riskFilter) params.risk_filter = riskFilter
      if (search) params.search = search
      const data: StudentsResponse = await getStudents(params)
      setStudents(data.students || data.records || [])
      setTotalRecords(data.total || 0)
    } catch {
      if (!error) setError('Failed to load student records')
    } finally {
      setTableLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadStudents()
  }

  async function handleUpload(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported')
      return
    }
    try {
      setUploading(true)
      setError('')
      setUploadResult(null)
      const result = await uploadDataset(file)
      setUploadResult(result)
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Upload failed'
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLookup = async () => {
    const id = lookupId.trim()
    if (!id) { setError('Enter a student ID (e.g., STU-0042 or 42)'); return }
    setLookupLoading(true)
    setError('')
    setLookupResult(null)
    try {
      const data = await getStudentTracking(id)
      setLookupResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Student not found')
    } finally {
      setLookupLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['student_id','attendance','study_hours','assignment_completion','internal_marks','previous_gpa','participation_score','sleep_hours','internet_access','family_support','extra_curricular']
    const sample = ['STU-0001',85,4,78,72,7.5,65,7,1,1,1]
    const csv = [headers.join(','), sample.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'student_data_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const updateManualField = (key: string, value: number) => setManualForm(prev => ({ ...prev, [key]: value }))

  const addManualEntry = () => {
    const entry: Record<string, any> = { ...manualForm }
    if (!entry.student_id) entry.student_id = `#${manualEntries.length + 1}`
    setManualEntries(prev => [...prev, entry])
    setBatchResults(null)
  }

  const removeManualEntry = (index: number) => {
    setManualEntries(prev => prev.filter((_, i) => i !== index))
    setBatchResults(null)
  }

  const runBatchPredict = async () => {
    if (manualEntries.length === 0) return
    setBatchLoading(true)
    setError('')
    setBatchResults(null)
    try {
      const results = await predictBatch(manualEntries)
      setBatchResults(results)
    } catch (err: any) {
      setError(err?.message || 'Batch prediction failed')
    } finally {
      setBatchLoading(false)
    }
  }

  async function handleRandomStudent() {
    try {
      setRandomLoading(true)
      const data = await getRandomStudent()
      setRandomStudent(data)
    } catch {
      setError('Failed to fetch random student')
    } finally {
      setRandomLoading(false)
    }
  }

  function handleFilterChange(value: string) {
    setRiskFilter(value)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage))

  const passRatio = (summary?.pass_ratio as { pass?: number; fail?: number } | undefined) ?? {}
  const passCount = passRatio?.pass ?? summary?.pass_count ?? '—'
  const failCount = passRatio?.fail ?? summary?.fail_count ?? '—'
  const totalRec = summary?.total_records ?? summary?.total_students ?? '—'
  const missingCount = typeof summary?.missing_values === 'object' && summary?.missing_values !== null
    ? Object.values(summary.missing_values as Record<string, unknown>).filter(v => v !== 0).length
    : 0

  const summaryCards = [
    { label: 'Total Records', value: totalRec, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-4 h-4"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>' },
    { label: 'Pass Count', value: passCount, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-4 h-4"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
    { label: 'Fail Count', value: failCount, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>' },
    { label: 'Columns with Missings', value: missingCount, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  ]

  const riskColors: Record<string, string> = {
    'high risk': 'text-red-600 bg-red-50',
    'medium risk': 'text-orange-600 bg-orange-50',
    'low risk': 'text-green-600 bg-green-50',
  }

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
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">Dataset Explorer</h1>
          </div>
          <p className="text-gray-500 text-lg ml-[52px]">
            Browse, search, and explore the student dataset used for training the risk prediction model.
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {summaryCards.map((card, i) => (
            <div key={i} className="glass-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#f97316]" dangerouslySetInnerHTML={{ __html: card.icon }} />
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
                {loading ? <span className="skeleton inline-block w-16 h-8 align-middle" /> : String(card.value)}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card p-4 sm:p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Upload CSV for Batch Prediction</h2>
              <button onClick={downloadTemplate}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download Template
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".csv"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {uploading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Processing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Upload CSV</>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">CSV must include: attendance, study_hours, assignment_completion, internal_marks, previous_gpa, participation_score, sleep_hours, internet_access, family_support, extra_curricular</p>

          {uploadResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">Processed {uploadResult.processed} of {uploadResult.total_rows} rows</p>
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                {uploadResult.results?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white rounded-lg p-2 border border-emerald-100">
                    <span className="text-gray-500 font-mono">{r.student_id || `Row ${r.row}`}</span>
                    {r.error ? (
                      <span className="text-red-500">{r.error}</span>
                    ) : (
                      <span className={`font-medium ${r.prediction?.risk_level === 'Low Risk' ? 'text-emerald-600' : r.prediction?.risk_level === 'Medium Risk' ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.prediction?.risk_level} ({r.prediction?.pass_prediction}) — {(r.prediction?.probability_pass * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.17 }}
          className="glass-card p-4 sm:p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-sm">✎</span>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Manual Data Entry</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Student ID</label>
              <input type="text"
                value={manualForm.student_id}
                onChange={e => setManualForm(prev => ({ ...prev, student_id: e.target.value }))}
                placeholder="STU-0001"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
            {['attendance','study_hours','assignment_completion','internal_marks','previous_gpa','participation_score','sleep_hours'].map(k => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-0.5 capitalize">{k.replace(/_/g, ' ')}</label>
                <input type="number" step="any"
                  value={manualForm[k]}
                  onChange={e => updateManualField(k, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
              </div>
            ))}
            {['internet_access','family_support','extra_curricular'].map(k => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-0.5 capitalize">{k.replace(/_/g, ' ')}</label>
                <select value={manualForm[k]} onChange={e => updateManualField(k, parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={addManualEntry}
              className="px-4 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-sm font-medium transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add to Batch
            </button>
            {manualEntries.length > 0 && (
              <span className="text-xs text-gray-500">{manualEntries.length} student(s) in batch</span>
            )}
          </div>

          {manualEntries.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="max-h-40 overflow-y-auto space-y-1.5 mb-3">
                {manualEntries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                    <span className="font-mono text-gray-500">{entry.student_id || `#${i + 1}`}</span>
                    <span className="text-gray-600">A:{entry.attendance}% S:{entry.study_hours}h M:{entry.internal_marks} GPA:{entry.previous_gpa}</span>
                    <button onClick={() => removeManualEntry(i)} className="text-red-400 hover:text-red-600 font-medium">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={runBatchPredict} disabled={batchLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {batchLoading ? 'Predicting...' : `Run Prediction on ${manualEntries.length} Student(s)`}
              </button>
            </motion.div>
          )}

          {batchResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-1.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Batch Results</p>
              {batchResults.map((r, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                  r.success ? (r.data?.risk_level === 'Low Risk' ? 'bg-emerald-50' : r.data?.risk_level === 'Medium Risk' ? 'bg-amber-50' : 'bg-red-50') : 'bg-red-50'
                }`}>
                  <span className="font-mono text-gray-500">{r.student_id || `#${i + 1}`}</span>
                  {r.success ? (
                    <>
                      <span className={`font-medium ${
                        r.data?.risk_level === 'Low Risk' ? 'text-emerald-700' : r.data?.risk_level === 'Medium Risk' ? 'text-amber-700' : 'text-red-700'
                      }`}>{r.data?.risk_level}</span>
                      <span className="text-gray-600">{r.data?.pass_prediction} ({(r.data?.probability_pass * 100).toFixed(0)}%)</span>
                    </>
                  ) : (
                    <span className="text-red-500">{r.error}</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="glass-card p-4 sm:p-6 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Lookup Student by ID</h2>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input type="text" value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="STU-0042 or 42"
              className="flex-1 max-w-xs px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            <button onClick={handleLookup} disabled={lookupLoading}
              className="px-4 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
              {lookupLoading ? '...' : 'Lookup'}
            </button>
          </div>

          {lookupResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div><span className="text-xs text-gray-500">ID</span><p className="font-mono font-semibold">{lookupResult.student?.student_id || lookupResult.student?.id}</p></div>
                  <div>
                    <span className="text-xs text-gray-500">Risk</span>
                    <p className={`font-semibold ${
                      lookupResult.risk_category === 'Low Risk' ? 'text-emerald-600' :
                      lookupResult.risk_category === 'Medium Risk' ? 'text-amber-600' : 'text-red-600'
                    }`}>{lookupResult.risk_category}</p>
                  </div>
                  <div><span className="text-xs text-gray-500">Prediction</span><p className="font-semibold">{lookupResult.prediction?.pass_prediction}</p></div>
                  <div><span className="text-xs text-gray-500">Confidence</span><p className="font-semibold">{(lookupResult.prediction?.probability_pass * 100).toFixed(0)}%</p></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {['attendance','study_hours','assignment_completion','internal_marks','previous_gpa','participation_score','sleep_hours','internet_access','family_support','extra_curricular'].map(k => (
                    <div key={k} className="bg-white rounded px-2 py-1 border border-amber-100">
                      <span className="text-gray-400">{k.replace(/_/g, ' ')}</span>
                      <p className="font-mono font-medium">{lookupResult.student?.[k] ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-4 sm:p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Student Records</h2>
            <button
              onClick={handleRandomStudent}
              disabled={randomLoading}
              className="px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {randomLoading ? '···' : '🎲 Random Student'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, name, or attributes..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-all"
              >
                Search
              </button>
            </form>
            <select
              value={riskFilter}
              onChange={e => handleFilterChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30"
            >
              <option value="">All Risk Categories</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
            </select>
          </div>

          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full align-middle px-4 sm:px-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 pr-4 font-medium text-gray-400 whitespace-nowrap">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400 whitespace-nowrap">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400 whitespace-nowrap">Study Hrs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400 whitespace-nowrap">Assignments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400 whitespace-nowrap">Int. Marks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400 whitespace-nowrap">Prev GPA</th>
                    <th className="text-left py-3 pl-4 font-medium text-gray-400 whitespace-nowrap">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td colSpan={7} className="py-3">
                          <div className="skeleton h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student, i) => {
                      const risk = (student.risk_category || '').toLowerCase()
                      return (
                        <tr key={student.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap">{student.id ?? '—'}</td>
                          <td className="py-3 px-4 text-[#1a1a2e] whitespace-nowrap">{student.attendance ?? '—'}</td>
                          <td className="py-3 px-4 text-[#1a1a2e] whitespace-nowrap">{student.study_hours ?? '—'}</td>
                          <td className="py-3 px-4 text-[#1a1a2e] whitespace-nowrap">{student.assignment_completion ?? '—'}</td>
                          <td className="py-3 px-4 text-[#1a1a2e] whitespace-nowrap">{student.internal_marks ?? '—'}</td>
                          <td className="py-3 px-4 text-[#1a1a2e] whitespace-nowrap">{student.previous_gpa ?? '—'}</td>
                          <td className="py-3 pl-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[risk] || 'text-gray-500 bg-gray-50'}`}>
                              {student.risk_category || '—'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">No student records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages} ({totalRecords} total records)
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, page - 2)
                  const p = start + i
                  if (p > totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-[#1a1a2e] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {randomStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="dark-panel p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎲</span>
              <h2 className="text-lg font-semibold text-white">Random Student Record</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(randomStudent).filter(([k]) => typeof randomStudent[k] !== 'object').map(([key, val]) => (
                <div key={key} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-medium text-white font-mono">{String(val)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
