import React from 'react'

export default function RiskBadge({ threat_level, confidence }) {
  let badgeStyle = 'bg-[#bbc9cd]/10 text-[#bbc9cd] border border-[#bbc9cd]/25'

  if (threat_level === 'Safe') {
    badgeStyle = 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/25 font-semibold'
  } else if (threat_level === 'Suspicious') {
    badgeStyle = 'bg-[#ffb13b]/15 text-[#ffb13b] border border-[#ffb13b]/25 font-semibold'
  } else if (threat_level === 'Dangerous') {
    badgeStyle = 'bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/25 font-bold'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider ${badgeStyle}`}>
      <span>{threat_level}</span>
      {confidence && (
        <>
          <span className="opacity-50">•</span>
          <span className="text-[10px] font-mono font-medium">{confidence} CONFIDENCE</span>
        </>
      )}
    </span>
  )
}
