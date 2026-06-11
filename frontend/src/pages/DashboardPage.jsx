import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    let strokeColor = '#2fd9f4';
    if (data.name === 'Safe') strokeColor = '#22c55e';
    else if (data.name === 'Suspicious') strokeColor = '#ffb13b';
    else if (data.name === 'Dangerous') strokeColor = '#ffb4ab';

    return (
      <div className="bg-[#0e1416]/95 border border-outline-variant/20 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg text-[#dde4e5]">
        <p className="font-bold mb-0.5" style={{ color: strokeColor }}>{data.name}</p>
        <p className="flex justify-between gap-4">
          <span>Scans:</span>
          <span className="font-bold text-white">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

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
      <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 max-w-4xl mx-auto mt-12">
        <LoadingSpinner message="Retrieving live threat telemetry..." />
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

  // Pre-formatted data for Recharts Pie Chart
  const chartData = [
    { name: 'Safe', value: stats.safe_count },
    { name: 'Suspicious', value: stats.suspicious_count },
    { name: 'Dangerous', value: stats.dangerous_count }
  ].filter(item => item.value > 0)

  const colors = {
    Safe: '#22c55e',
    Suspicious: '#ffb13b',
    Dangerous: '#ffb4ab'
  }

  const safePercentage = stats.total_scans > 0
    ? ((stats.safe_count / stats.total_scans) * 100).toFixed(1)
    : '100.0'

  const suspiciousPercentage = stats.total_scans > 0
    ? ((stats.suspicious_count / stats.total_scans) * 100).toFixed(1)
    : '0.0'

  const dangerousPercentage = stats.total_scans > 0
    ? ((stats.dangerous_count / stats.total_scans) * 100).toFixed(1)
    : '0.0'

  const trend = stats?.trend_data || []
  const maxCount = Math.max(...trend.map(t => t.count), 0)

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Security Intelligence Dashboard</h1>
          <p className="font-body-md text-on-surface-variant">Real-time monitoring of global digital signals and emerging threat vectors.</p>
        </div>
        <div className="flex gap-stack-sm">
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-label-caps font-label-caps text-on-surface">Network: Active</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span className="text-label-caps font-label-caps text-on-surface">Last 30 Days</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Total Scans */}
        <div className="glass-card p-stack-md rounded-xl hover:shadow-[0_0_20px_rgba(47,217,244,0.15)] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <span className="text-primary text-label-caps font-semibold">+100%</span>
          </div>
          <p className="text-on-surface-variant font-label-caps mb-1">Total Scans</p>
          <h3 className="text-headline-lg font-headline-lg text-primary font-mono">{stats.total_scans.toLocaleString()}</h3>
        </div>
        {/* Safe Links */}
        <div className="glass-card p-stack-md rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#22c55e]">verified_user</span>
            <span className="text-[#22c55e] text-label-caps font-semibold">{safePercentage}%</span>
          </div>
          <p className="text-on-surface-variant font-label-caps mb-1">Safe Links</p>
          <h3 className="text-headline-lg font-headline-lg text-[#22c55e] font-mono">{stats.safe_count.toLocaleString()}</h3>
        </div>
        {/* Suspicious Links */}
        <div className="glass-card p-stack-md rounded-xl hover:shadow-[0_0_20px_rgba(255,177,59,0.15)] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-tertiary">warning</span>
            <span className="text-tertiary text-label-caps font-semibold">{suspiciousPercentage}%</span>
          </div>
          <p className="text-on-surface-variant font-label-caps mb-1">Suspicious Links</p>
          <h3 className="text-headline-lg font-headline-lg text-tertiary font-mono">{stats.suspicious_count.toLocaleString()}</h3>
        </div>
        {/* Dangerous Links */}
        <div className="glass-card p-stack-md rounded-xl hover:shadow-[0_0_20px_rgba(255,180,171,0.15)] transition-all border-l-4 border-error/50">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-error">dangerous</span>
            <span className="text-error text-label-caps font-semibold">{dangerousPercentage}%</span>
          </div>
          <p className="text-on-surface-variant font-label-caps mb-1">Dangerous Links</p>
          <h3 className="text-headline-lg font-headline-lg text-error font-mono">{stats.dangerous_count.toLocaleString()}</h3>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Threat Distribution */}
        <div className="glass-card p-stack-lg rounded-xl flex flex-col justify-between overflow-hidden">
          <div className="w-full mb-4">
            <h4 className="font-headline-sm text-headline-sm">Threat Distribution</h4>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Classification by risk category</p>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full flex justify-center items-center h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="rgba(14, 20, 22, 0.4)"
                        stroke={colors[entry.name]}
                        strokeWidth={1.5}
                      />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'Geist, monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center h-[200px] text-center text-on-surface-variant/60 text-xs italic">
              No telemetry data available.
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 w-full mt-4">
            <div className="text-center">
              <div className="w-full h-1 bg-[#22c55e] rounded-full mb-1"></div>
              <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">Safe</span>
            </div>
            <div className="text-center">
              <div className="w-full h-1 bg-[#ffb13b] rounded-full mb-1"></div>
              <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">Suspicious</span>
            </div>
            <div className="text-center">
              <div className="w-full h-1 bg-error rounded-full mb-1"></div>
              <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">Dangerous</span>
            </div>
          </div>
        </div>

        {/* Risk Trend */}
        <div className="glass-card p-stack-lg rounded-xl lg:col-span-2 overflow-hidden relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-headline-sm text-headline-sm">Risk Trend</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Activity timeline over last 30 days</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded text-label-caps text-[10px] uppercase font-bold tracking-wider border border-primary/20">
                ACTIVE PIPELINE
              </span>
            </div>
          </div>
          {/* Waveform/Timeline from backend telemetry */}
          <div className="h-40 w-full flex items-end gap-1.5 px-2 relative">
            <div className="cyber-scanner-line absolute left-0 right-0 z-10"></div>
            {trend.map((item, index) => {
              const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              // Visual enhancement: default empty state has small placeholder line of 4% height, otherwise scale with min of 15% height
              const displayHeight = item.count > 0 ? Math.max(heightPercent, 15) : 5;
              const isDangerous = item.max_risk >= 70;

              return (
                <div
                  key={index}
                  style={{ height: `${displayHeight}%` }}
                  className={`flex-1 transition-all rounded-t-sm group relative cursor-pointer ${
                    isDangerous
                      ? 'bg-error/35 hover:bg-error/55 animate-pulse'
                      : item.count > 0
                      ? 'bg-primary/25 hover:bg-primary/45'
                      : 'bg-primary/5 hover:bg-primary/20'
                  }`}
                >
                  {/* Premium hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-[#0e1416]/95 border border-[#94a3b8]/20 px-3 py-1.5 rounded text-[10px] text-[#dde4e5] font-mono whitespace-nowrap shadow-lg">
                      <p className="font-bold text-primary mb-1">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="flex justify-between gap-4">
                        <span>Scans:</span>
                        <span className="font-bold text-on-surface">{item.count}</span>
                      </p>
                      {item.count > 0 && (
                        <p className="flex justify-between gap-4">
                          <span>Max Risk:</span>
                          <span className={`font-bold ${isDangerous ? 'text-error' : 'text-primary'}`}>
                            {item.max_risk}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#0e1416] border-r border-b border-[#94a3b8]/20 rotate-45 -mt-1"></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 px-2 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider">
            <span>30 days ago</span>
            <span>15 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/20">
        <div className="px-stack-lg py-stack-md border-b border-outline-variant/10 flex justify-between items-center">
          <h4 className="font-headline-sm text-headline-sm">Recent Scan Activity</h4>
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Live Log Node</span>
        </div>

        {stats.recent_scans && stats.recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/20 border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">URL / Domain</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase text-center">Risk Score</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">Risk Level</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">Timestamp</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {stats.recent_scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => navigate(`/report/${scan.id}`)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-data-mono text-data-mono text-on-surface break-all max-w-xs md:max-w-md">
                      {scan.input_value}
                    </td>
                    <td className="px-6 py-4 text-center font-data-mono text-on-surface font-semibold">
                      {scan.risk_score}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge threat_level={scan.threat_level} />
                    </td>
                    <td className="px-6 py-4 text-xs font-data-mono text-on-surface-variant">
                      {scan.scanned_at ? new Date(scan.scanned_at).toLocaleString() : 'Unknown Date'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-outline-variant/20 hover:bg-primary text-on-surface hover:text-on-primary-fixed px-4 py-1.5 rounded font-label-caps text-[10px] tracking-wider uppercase transition-all duration-300 font-bold">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-on-surface-variant/60 text-xs italic">
            No scans registered yet.
          </div>
        )}
      </div>
    </div>
  )
}
