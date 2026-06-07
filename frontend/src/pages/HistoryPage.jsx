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
        return 'text-green-600'
      case 'Suspicious':
        return 'text-yellow-600'
      case 'Dangerous':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'bg-blue-100 text-blue-800'
      case 'Medium':
        return 'bg-purple-100 text-purple-800'
      case 'Low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <LoadingSpinner message="Retrieving scan history..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-4 shadow-sm">
        <span className="text-3xl" role="img" aria-label="error">⚠️</span>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Scan History</h1>
        <p className="mt-1 text-sm text-gray-500">
          All URLs scanned by ThreatLens AI.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:max-w-xs">
          <label htmlFor="search-logs" className="sr-only">Search scans</label>
          <input
            id="search-logs"
            type="text"
            placeholder="Search URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Levels */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {['All', 'Safe', 'Suspicious', 'Dangerous'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors duration-200 ${
                filterLevel === level
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Showing count */}
      <div className="text-xs text-gray-500 font-medium px-1">
        Showing {filteredScans.length} of {scans.length} scans
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filteredScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                  <th className="p-4">URL / IP Address</th>
                  <th className="p-4 text-center">Risk Score</th>
                  <th className="p-4">Threat Level</th>
                  <th className="p-4 text-center">Confidence</th>
                  <th className="p-4">Scanned At</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-800 break-all max-w-xs md:max-w-md">
                      {scan.input_value.length > 60
                        ? `${scan.input_value.substring(0, 60)}...`
                        : scan.input_value}
                    </td>
                    <td className={`p-4 text-center font-extrabold ${getScoreColor(scan.threat_level)}`}>
                      {scan.risk_score}
                    </td>
                    <td className="p-4">
                      <RiskBadge threat_level={scan.threat_level} />
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getConfidenceBadge(scan.confidence)}`}>
                        {scan.confidence || 'Medium'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link
                        to={`/report/${scan.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs border border-blue-200 hover:border-blue-400 px-3 py-1 rounded bg-blue-50/50 hover:bg-blue-50 transition-all"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm">
            No scans found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}
