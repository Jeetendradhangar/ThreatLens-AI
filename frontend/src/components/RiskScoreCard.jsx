import React from 'react'
import RiskBadge from './RiskBadge'

export default function RiskScoreCard({ risk_score, threat_level, confidence, summary }) {
  let borderColor = 'border-l-4 border-gray-300'
  let barColor = 'bg-gray-500'

  if (threat_level === 'Safe') {
    borderColor = 'border-l-4 border-green-500'
    barColor = 'bg-green-500'
  } else if (threat_level === 'Suspicious') {
    borderColor = 'border-l-4 border-yellow-500'
    barColor = 'bg-yellow-500'
  } else if (threat_level === 'Dangerous') {
    borderColor = 'border-l-4 border-red-500'
    barColor = 'bg-red-500'
  }

  // Ensure progress bar width is bound between 0 and 100
  const progressPercent = Math.max(0, Math.min(100, risk_score))

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${borderColor} flex flex-col md:flex-row md:items-center md:justify-between gap-6`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900">Risk Assessment</h3>
          <RiskBadge threat_level={threat_level} confidence={confidence} />
        </div>
        <p className="text-gray-600 text-sm">{summary}</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
            <span className="text-green-600">Safe (0-30)</span>
            <span className="text-yellow-600">Suspicious (31-69)</span>
            <span className="text-red-600">Dangerous (70-100)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg min-w-[120px] border border-gray-100">
        <span className="text-xs text-gray-500 uppercase font-semibold">Risk Score</span>
        <span className="text-4xl font-extrabold text-gray-950 mt-1">{risk_score}</span>
        <span className="text-xs text-gray-400 mt-0.5">out of 100</span>
      </div>
    </div>
  )
}
