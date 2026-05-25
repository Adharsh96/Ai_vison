import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' },
} as const

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.12 },
} as const

const cardHover = {
  whileHover: { y: -6, transition: { duration: 0.3 } },
}

function BrainIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className={className}>
      <path d="M12 2a4 4 0 014 4c0 2-2 4-4 4s-4-2-4-4 2-4 4-4z"/>
      <path d="M4 22c0-4 3.6-8 8-8s8 4 8 8"/>
      <circle cx="12" cy="6" r="1.5" fill="#f97316" stroke="none"/>
      <path d="M8 14a4 4 0 018 0" strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}

function ChartIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}

function ZapIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

function AnalyticsIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function DataInIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  )
}

function RefreshIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  )
}

function SettingsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function TargetIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )
}

function CheckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function RocketIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  )
}

const features = [
  {
    icon: BrainIcon,
    title: 'AI-Powered Prediction',
    desc: 'Decision tree ML model analyzes academic patterns to predict student performance risk with 92% accuracy.',
  },
  {
    icon: ChartIcon,
    title: 'Explainable AI',
    desc: 'Understand every prediction with SHAP-based feature importance and interactive decision path visualization.',
  },
  {
    icon: ZapIcon,
    title: 'Real-Time Alerts',
    desc: 'Get instant tutor alerts when at-risk students are detected, enabling early intervention before it\'s too late.',
  },
  {
    icon: AnalyticsIcon,
    title: 'Analytics Dashboard',
    desc: 'Comprehensive dashboards with cohort breakdowns, risk distribution, and trend analysis across student groups.',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Input Student Data',
    desc: 'Enter academic records including GPA, study hours, attendance, and previous grades into the prediction system.',
  },
  {
    step: '02',
    title: 'ML Model Analysis',
    desc: 'Our decision tree classifier processes the data, evaluating multiple academic features against trained risk patterns.',
  },
  {
    step: '03',
    title: 'Review Results',
    desc: 'Receive instant risk classification with detailed explanations showing which factors contributed most to the prediction.',
  },
  {
    step: '04',
    title: 'Take Action',
    desc: 'Use actionable insights to schedule interventions, allocate resources, and support students before they fall behind.',
  },
]

const workflowSteps = [
  { title: 'Data Collection', desc: 'Academic records, demographic data, behavioral metrics, and historical performance are aggregated into a unified dataset.', icon: DataInIcon },
  { title: 'Preprocessing', desc: 'Missing values are handled, categorical features are encoded, and numerical features are normalized for model readiness.', icon: RefreshIcon },
  { title: 'Feature Engineering', desc: 'Key predictors are extracted including GPA trends, attendance patterns, study hours, and course load analysis.', icon: SettingsIcon },
  { title: 'Model Training', desc: 'Decision tree classifier is trained on labeled historical data with cross-validation to ensure robust performance.', icon: TargetIcon },
  { title: 'Evaluation', desc: 'Model is validated against held-out test sets using accuracy, precision, recall, and F1-score metrics.', icon: CheckIcon },
  { title: 'Deployment', desc: 'Trained model is served via FastAPI backend, providing real-time predictions through a responsive React frontend.', icon: RocketIcon },
]

const stats = [
  { end: 1500, suffix: '+', label: 'Students Analyzed' },
  { end: 92, suffix: '%', label: 'Model Accuracy' },
  { end: 10, suffix: '+', label: 'Features' },
  { end: 99, suffix: '%', label: 'Real-time Predictions' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-transparent to-amber-100/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700 mb-6"
              >
                <BrainIcon className="w-4 h-4" />
                Academic Risk Intelligence
              </motion.span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a2e] leading-tight">
                Predict Student Risk{' '}
                <span className="gradient-text">Using AI</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
                Leverage machine learning to identify at-risk students early. 
                Our decision tree model analyzes academic patterns and delivers 
                actionable insights in real time.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/predict"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-[#1a1a2e] text-white font-semibold text-sm hover:bg-[#2a2a4e] transition-all shadow-lg shadow-gray-900/20"
                >
                  Try the Predictor
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-[#1a1a2e] font-semibold text-sm border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-72 h-72 rounded-full accent-gradient opacity-10 absolute -top-6 -right-6 blur-3xl" />
                <div className="relative w-full max-w-md p-8 rounded-2xl dark-panel shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-400 ml-2 font-mono">prediction-terminal</span>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <p className="text-green-400">$ <span className="text-amber-300">analyze</span> --student "STU-0842"</p>
                    <p className="text-gray-300">Loading model: <span className="text-amber-400">decision_tree_v2.pkl</span></p>
                    <p className="text-gray-300">Processing features...</p>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full accent-gradient rounded-full animate-pulse-slow" style={{ width: '78%' }} />
                    </div>
                    <p className="text-amber-400 font-semibold mt-4">✓ Prediction Complete</p>
                    <p className="text-white">Risk Level: <span className="text-amber-400 font-bold">HIGH</span></p>
                    <p className="text-gray-400 text-xs">Confidence: 92.3% | Features analyzed: 10</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Counters */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="glass-card p-6 sm:p-8 text-center"
              >
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                <p className="mt-2 text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">
              Everything You Need for{' '}
              <span className="gradient-text">Student Risk Analysis</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              A comprehensive platform built for educators and academic institutions.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  {...cardHover}
                  className="glass-card p-6 sm:p-8 cursor-default"
                >
                  <Icon />
                  <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              From data input to actionable insights in four simple steps.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-12 bottom-12 w-px bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 -translate-x-1/2" />
            <div className="space-y-12 lg:space-y-0">
              {howItWorks.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                    i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`glass-card p-6 sm:p-8 ${i % 2 === 0 ? 'lg:text-right' : ''}`}>
                      <span className="inline-block text-4xl font-bold gradient-text mb-2">{step.step}</span>
                      <h3 className="text-xl font-semibold text-[#1a1a2e]">{step.title}</h3>
                      <p className="mt-2 text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full accent-gradient text-white font-bold text-sm shrink-0 relative z-10">
                    {step.step}
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Early Intervention Matters */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">
                Why <span className="gradient-text">Early Intervention</span> Matters
              </h2>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                Research shows that identifying at-risk students early can improve academic outcomes by up to 40%. 
                Our platform gives educators the tools they need to intervene before it's too late.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: TargetIcon, text: 'Targeted support for struggling students' },
                  { icon: ChartIcon, text: 'Reduce dropout rates with proactive measures' },
                  { icon: AnalyticsIcon, text: 'Data-driven resource allocation' },
                  { icon: BrainIcon, text: 'Improved student-educator communication' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-gray-700">
                      <Icon className="w-5 h-5" />
                      <span>{item.text}</span>
                    </li>
                  )
                })}
              </ul>
              <Link
                to="/predict"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-amber-500/30"
              >
                Start Predicting Now
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="dark-panel p-8 sm:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Impact Statistics</span>
                </div>
                <div className="space-y-6">
                  {[
                    { value: '40%', label: 'Improvement in academic outcomes with early intervention' },
                    { value: '3x', label: 'More effective than late-stage remediation' },
                    { value: '85%', label: 'Of at-risk students identified correctly by our model' },
                  ].map((item) => (
                    <div key={item.label} className="border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">
                      <span className="text-3xl font-bold gradient-text">{item.value}</span>
                      <p className="text-sm text-gray-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ML Workflow Section */}
      <section className="py-16 sm:py-20 bg-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Machine Learning <span className="gradient-text">Workflow</span>
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              From raw data to production-ready predictions — our end-to-end ML pipeline.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  {...cardHover}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8"
                >
                  <Icon className="w-7 h-7 text-amber-400" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Dataset Insights */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <div className="glass-card p-8 sm:p-10">
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-4">Dataset Composition</h3>
                <div className="space-y-4">
                  {[
                    { feature: 'GPA', importance: 0.28, color: 'bg-amber-500' },
                    { feature: 'Study Hours/Week', importance: 0.22, color: 'bg-amber-400' },
                    { feature: 'Attendance %', importance: 0.18, color: 'bg-amber-500' },
                    { feature: 'Previous Grades', importance: 0.15, color: 'bg-amber-400' },
                    { feature: 'Course Load', importance: 0.10, color: 'bg-amber-300' },
                    { feature: 'Extracurricular', importance: 0.07, color: 'bg-amber-300' },
                  ].map((item) => (
                    <div key={item.feature}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{item.feature}</span>
                        <span className="text-gray-500">{(item.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.importance * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700 mb-6">
                <BrainIcon className="w-4 h-4" />
                Dataset Insights
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">
                Understanding the{' '}
                <span className="gradient-text">Feature Impact</span>
              </h2>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                Our model evaluates multiple academic and behavioral factors to determine student risk. 
                GPA and study habits are the strongest predictors, but attendance and course load also 
                play significant roles in the final classification.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/dataset"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-[#1a1a2e] text-white font-semibold text-sm hover:bg-[#2a2a4e] transition-all"
                >
                  Explore Dataset
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
                <Link
                  to="/model-performance"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-[#1a1a2e] font-semibold text-sm border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                >
                  View Model Metrics
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="dark-panel p-10 sm:p-14"
          >
            <BrainIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Academic <span className="gradient-text">Risk Assessment</span>?
            </h2>
            <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
              Join institutions using AI to predict and prevent student academic risk.
            </p>
            <Link
              to="/predict"
              className="mt-8 inline-flex items-center px-8 py-3.5 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-amber-500/30"
            >
              Get Started Now
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-8 inline-block"
          >
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
                <path d="M12 2a4 4 0 014 4c0 2-2 4-4 4s-4-2-4-4 2-4 4-4z"/>
                <path d="M4 22c0-4 3.6-8 8-8s8 4 8 8"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#1a1a2e]">Created by <span className="gradient-text">Adharsh M R</span></p>
            <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
              This software is provided for use with attribution. Modification and redistribution of modified versions are prohibited without explicit permission.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}