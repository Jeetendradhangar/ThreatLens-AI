import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

export default function HistoryPage() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('All')

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const resp = await api.get('/api/scans/')
        setScans(resp.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch scan logs.')
      } finally {
        setLoading(false)
      }
    }
    fetchScans()
  }, [])

  // Computed properties
  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.input_value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterLevel === 'All' || scan.threat_level === filterLevel
    return matchesSearch && matchesFilter
  })

  const getScoreColor = (level) => {
    switch (level) {
      case 'Safe':
        return 'text-[#22c55e]'
      case 'Suspicious':
        return 'text-tertiary'
      case 'Dangerous':
        return 'text-error'
      default:
        return 'text-on-surface-variant'
    }
  }

  const getScoreBarColor = (level) => {
    switch (level) {
      case 'Safe':
        return 'bg-[#22c55e]'
      case 'Suspicious':
        return 'bg-tertiary'
      case 'Dangerous':
        return 'bg-error'
      default:
        return 'bg-outline'
    }
  }

  const getThreatIcon = (level) => {
    switch (level) {
      case 'Safe':
        return <span className="material-symbols-outlined text-[#22c55e] text-lg">verified</span>
      case 'Suspicious':
        return <span className="material-symbols-outlined text-tertiary text-lg">warning</span>
      case 'Dangerous':
        return <span className="material-symbols-outlined text-error text-lg">dangerous</span>
      default:
        return <span className="material-symbols-outlined text-outline text-lg">help</span>
    }
  }

  // Simple CSV Export function
  const handleExportCSV = () => {
    if (filteredScans.length === 0) return
    const headers = ['ID', 'Input Target', 'Normalized URL', 'Risk Score', 'Threat Level', 'Confidence', 'Scanned At']
    const rows = filteredScans.map(s => [
      s.id,
      s.input_value,
      s.normalized_url || '',
      s.risk_score,
      s.threat_level,
      s.confidence || 'Medium',
      s.scanned_at
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `threatlens_audit_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 max-w-4xl mx-auto mt-12">
        <LoadingSpinner message="Retrieving scan history logs..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 glass-panel p-8 rounded-xl border border-error/30 text-center flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <p className="text-error font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Filters */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary">Scan History</h1>
            <p className="text-on-surface-variant font-body-md">Audit and review all automated intelligence reports.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="glass-card flex items-center px-3 py-1.5 rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline-variant mr-2 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-sm text-on-surface focus:outline-none placeholder:text-outline/40 w-44"
              />
            </div>

            {/* Filter Levels dropdown styled exactly like design */}
            <div className="glass-card flex items-center px-3 py-1.5 rounded-lg gap-2 border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline text-[20px]">filter_list</span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-sm font-medium text-on-surface cursor-pointer focus:outline-none"
              >
                <option value="All" className="bg-surface text-on-surface">Risk: All Levels</option>
                <option value="Dangerous" className="bg-surface text-on-surface">Risk: Dangerous</option>
                <option value="Suspicious" className="bg-surface text-on-surface">Risk: Suspicious</option>
                <option value="Safe" className="bg-surface text-on-surface">Risk: Safe</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={filteredScans.length === 0}
              className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="font-label-caps text-label-caps font-bold">Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Count Indicator */}
      <div className="text-xs text-on-surface-variant/70 font-label-caps tracking-wider px-1">
        SHOWING {filteredScans.length} OF {scans.length} AUDIT NODES
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/20">
        {filteredScans.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">URL / Domain</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Risk Score</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Threat Level</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Scan Date</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="cyber-row transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {getThreatIcon(scan.threat_level)}
                          <span className="font-data-mono text-data-mono text-on-surface break-all max-w-xs md:max-w-md block">
                            {scan.input_value}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className={`${getScoreBarColor(scan.threat_level)} h-full`} style={{ width: `${scan.risk_score}%` }}></div>
                          </div>
                          <span className={`font-data-mono ${getScoreColor(scan.threat_level)} font-bold`}>
                            {scan.risk_score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <RiskBadge threat_level={scan.threat_level} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-on-surface-variant font-data-mono text-xs">
                          {scan.threat_level === 'Safe' ? 'Clean Result' : `${scan.confidence || 'Medium'} Confidence`}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-on-surface-variant font-data-mono text-xs whitespace-nowrap">
                          {scan.scanned_at ? new Date(scan.scanned_at).toLocaleString() : 'Unknown Date'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/report/${scan.id}`}
                          className="inline-flex p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
                          title="View Full Intel Report"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-based View */}
            <div className="block sm:hidden divide-y divide-outline-variant/10">
              {filteredScans.map((scan) => (
                <div key={scan.id} className="p-4 space-y-3 hover:bg-primary/5 active:bg-primary/10 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      {getThreatIcon(scan.threat_level)}
                      <span className="font-data-mono text-xs text-on-surface break-all max-w-[180px] block">
                        {scan.input_value}
                      </span>
                    </div>
                    <RiskBadge threat_level={scan.threat_level} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant">Risk:</span>
                      <span className={`font-data-mono font-bold ${getScoreColor(scan.threat_level)}`}>
                        {scan.risk_score}
                      </span>
                    </div>
                    <span className="text-on-surface-variant font-data-mono text-[10px]">
                      {scan.scanned_at ? new Date(scan.scanned_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-on-surface-variant font-data-mono">
                      {scan.threat_level === 'Safe' ? 'Clean Result' : `${scan.confidence || 'Medium'} Confidence`}
                    </span>
                    <Link
                      to={`/report/${scan.id}`}
                      className="text-primary hover:underline font-label-caps text-[10px] uppercase flex items-center gap-1 font-bold animate-pulse"
                    >
                      View Report <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-on-surface-variant/60 text-sm italic">
            No scans match the active search filters.
          </div>
        )}
      </div>
    </div>
  )
}
