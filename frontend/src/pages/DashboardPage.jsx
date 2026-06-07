import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await api.get('/api/dashboard/')
        setStats(resp.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <LoadingSpinner message="Loading dashboard statistics..." />
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

  // Pre-formatted data for Recharts Pie Chart
  const chartData = [
    { name: 'Safe', value: stats.safe_count },
    { name: 'Suspicious', value: stats.suspicious_count },
    { name: 'Dangerous', value: stats.dangerous_count }
  ].filter(item => item.value > 0) // Only display non-zero parts

  const colors = {
    Safe: '#22c55e',
    Suspicious: '#eab308',
    Dangerous: '#ef4444'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live overview of all scans processed by ThreatLens AI.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_scans}</p>
        </div>
        {/* Safe Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Safe</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.safe_count}</p>
        </div>
        {/* Suspicious Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suspicious</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.suspicious_count}</p>
        </div>
        {/* Dangerous Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dangerous</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.dangerous_count}</p>
        </div>
      </div>

      {/* Chart and Graph Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center sm:text-left">Threat Distribution</h3>
        {chartData.length > 0 ? (
          <div className="w-full flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Scans`, 'Scans Count']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10 text-sm">No distribution metrics available. Start by scanning some URLs!</p>
        )}
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
        </div>
        
        {stats.recent_scans && stats.recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                  <th className="p-4">URL / IP Address</th>
                  <th className="p-4 text-center">Risk Score</th>
                  <th className="p-4">Threat Level</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {stats.recent_scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => navigate(`/report/${scan.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-gray-800 break-all max-w-xs md:max-w-md">
                      {scan.input_value.length > 60
                        ? `${scan.input_value.substring(0, 60)}...`
                        : scan.input_value}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900">
                      {scan.risk_score}
                    </td>
                    <td className="p-4">
                      <RiskBadge threat_level={scan.threat_level} />
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10 text-sm">No recent scans. Please perform a scan to see recent history.</p>
        )}
      </div>
    </div>
  )
}
