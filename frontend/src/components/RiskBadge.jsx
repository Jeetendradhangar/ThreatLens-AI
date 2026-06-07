import React from 'react'

export default function RiskBadge({ threat_level, confidence }) {
  let colorClass = 'bg-gray-100 text-gray-800'

  if (threat_level === 'Safe') {
    colorClass = 'bg-green-100 text-green-800 border border-green-200'
  } else if (threat_level === 'Suspicious') {
    colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  } else if (threat_level === 'Dangerous') {
    colorClass = 'bg-red-100 text-red-800 border border-red-200 font-semibold'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${colorClass}`}>
      <span>{threat_level}</span>
      {confidence && (
        <>
          <span className="mx-1 text-opacity-60">•</span>
          <span className="text-[10px] uppercase font-bold text-opacity-80">{confidence} confidence</span>
        </>
      )}
    </span>
  )
}
