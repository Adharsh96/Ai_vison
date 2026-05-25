import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Prediction from './pages/Prediction'
import ExplainableAI from './pages/ExplainableAI'
import Dashboard from './pages/Dashboard'
import TutorAlerts from './pages/TutorAlerts'
import DatasetExplorer from './pages/DatasetExplorer'
import ModelPerformance from './pages/ModelPerformance'
import Architecture from './pages/Architecture'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/predict" element={<Prediction />} />
        <Route path="/explainable-ai" element={<ExplainableAI />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tutor-alerts" element={<TutorAlerts />} />
        <Route path="/dataset" element={<DatasetExplorer />} />
        <Route path="/model-performance" element={<ModelPerformance />} />
        <Route path="/architecture" element={<Architecture />} />
      </Routes>
    </Layout>
  )
}
