import React from 'react'

export default function SignalList({ signals }) {
  if (!signals || signals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 text-sm">No risk signals detected. This URL appears clean.</p>
      </div>
    )
  }

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800 font-bold'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
      {signals.map((sig, idx) => (
        <div key={idx} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">{sig.signal_name}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getSeverityBadgeClass(sig.severity)}`}>
                {sig.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500">{sig.explanation}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
              +{sig.points} pts
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
