import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AIDirector from './pages/AIDirector'
import Storyboard from './pages/Storyboard'
import BrandLab from './pages/BrandLab'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Proposals from './pages/Proposals'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/yaratici-yonetmen" element={<AIDirector />} />
        <Route path="/storyboard" element={<Storyboard />} />
        <Route path="/marka-lab" element={<BrandLab />} />
        <Route path="/musteriler" element={<Clients />} />
        <Route path="/projeler" element={<Projects />} />
        <Route path="/projeler/:id" element={<ProjectDetail />} />
        <Route path="/teklifler" element={<Proposals />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
