import { motion } from 'framer-motion'

const icons = {
  frontend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  ml: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  predict: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  alerts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="w-5 h-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
}

interface Step {
  svg: string
  title: string
  description: string
  color: string
}

interface TechItem {
  name: string
  description: string
}

const steps: Step[] = [
  { svg: icons.frontend, title: 'Frontend (React)', description: 'Modern dashboard built with React 19, TypeScript, and Tailwind CSS v4. Recharts for analytics visualizations, Framer Motion for smooth animations.', color: 'from-[#f97316] to-[#fb923c]' },
  { svg: icons.api, title: 'API Layer (FastAPI)', description: 'RESTful API powered by FastAPI. Handles prediction requests, feature importance queries, dataset exploration, and model metrics retrieval.', color: 'from-[#fb923c] to-[#fdba74]' },
  { svg: icons.ml, title: 'ML Engine (Scikit-learn)', description: 'Core machine learning engine using Decision Tree classifier. Handles feature engineering, model inference, and explainability computations.', color: 'from-[#fdba74] to-[#f97316]' },
  { svg: icons.predict, title: 'Prediction System', description: 'Real-time risk assessment pipeline. Processes student data through trained model to generate risk categories: Low, Medium, or High Risk.', color: 'from-[#f97316] to-[#fb923c]' },
  { svg: icons.alerts, title: 'Tutor Alert Engine', description: 'Rule-based alert generation system that identifies at-risk students and triggers intervention recommendations with mentoring plans.', color: 'from-[#fb923c] to-[#fdba74]' },
  { svg: icons.dashboard, title: 'Dashboard Analytics', description: 'Aggregated insights showing risk distribution, feature correlations, trend analysis, and cohort comparisons across the student population.', color: 'from-[#fdba74] to-[#f97316]' },
]

const techStack: TechItem[] = [
  { name: 'React 19', description: 'Component-based UI framework' },
  { name: 'TypeScript', description: 'Type-safe development' },
  { name: 'Tailwind CSS v4', description: 'Utility-first styling' },
  { name: 'Framer Motion', description: 'Animation library' },
  { name: 'Recharts', description: 'Charting library' },
  { name: 'FastAPI', description: 'Python web framework' },
  { name: 'Scikit-learn', description: 'ML library' },
  { name: 'Axios', description: 'HTTP client' },
  { name: 'Vite', description: 'Build tool' },
]

export default function Architecture() {
  const renderIcon = (svg: string) => <span dangerouslySetInnerHTML={{ __html: svg.replace(/class="/g, 'class="w-5 h-5 ') }} />

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">Architecture</h1>
          </div>
          <p className="text-gray-500 text-lg ml-[52px]">
            End-to-end system architecture from user interface to machine learning engine.
          </p>
        </motion.div>

        <div className="relative mb-16">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f97316] via-[#fb923c] to-[#fdba74] -translate-x-1/2 opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative flex items-center gap-6 mb-6 ${
                i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } flex-col lg:flex-row`}
            >
              <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-center`}>
                <div className={`glass-card p-5 sm:p-6 inline-block w-full lg:max-w-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shrink-0`}>
                      {renderIcon(step.svg)}
                    </div>
                    <h3 className="font-semibold text-[#1a1a2e]">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-center shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  {renderIcon(step.svg)}
                </div>
                {i < steps.length - 1 && (
                  <div className="flow-arrow-container">
                    <svg className="w-6 h-6 text-[#f97316] mt-1 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: `${1.5 + i * 0.2}s` }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="lg:hidden flex flex-col items-center my-2">
                <svg className="w-5 h-5 text-[#f97316] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: `${1.5 + i * 0.2}s` }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="flex-1 hidden lg:block" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-[#1a1a2e] mb-6">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-[#f97316]/30 hover:bg-amber-50/30 transition-all cursor-default"
              >
                <p className="font-semibold text-sm text-[#1a1a2e]">{tech.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="dark-panel p-6 sm:p-8"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            Deployment Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/5 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h3 className="font-medium text-white text-sm">Frontend Hosting</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Static build deployed via Vite. Served through CDN for low-latency access. 
                Docker container available for self-hosted deployments.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fb923c] to-[#fdba74] flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <h3 className="font-medium text-white text-sm">API Server</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                FastAPI application served with Uvicorn. Horizontal scaling supported. 
                PostgreSQL for persistent storage, Redis for caching predictions.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fdba74] to-[#f97316] flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <h3 className="font-medium text-white text-sm">ML Model Serving</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pre-trained Decision Tree serialized with joblib. Model loaded at API startup 
                for fast inference. Versioned model registry supporting A/B testing.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}