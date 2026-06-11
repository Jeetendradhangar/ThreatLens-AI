import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScannerPage from './pages/ScannerPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface text-on-surface antialiased selection:bg-primary/30 cyber-grid">
        <Navbar />
        <main className="max-w-[1440px] mx-auto px-6 pt-28 pb-20">
          <Routes>
            <Route path="/" element={<Navigate to="/scan" replace />} />
            <Route path="/scan" element={<ScannerPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/report/:scanId" element={<ReportPage />} />
            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/scan" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
