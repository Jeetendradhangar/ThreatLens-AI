import React, { useEffect, useState } from 'react'
import RiskBadge from './RiskBadge'

export default function RiskScoreCard({ risk_score, threat_level, confidence, summary }) {
  const radius = 68
  const circumference = 2 * Math.PI * radius // ~427.25
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const progress = Math.max(0, Math.min(100, risk_score))
    const targetOffset = circumference - (progress / 100) * circumference
    setOffset(targetOffset)
  }, [risk_score, circumference])

  let color = '#2fd9f4' // Default primary cyan
  let textColor = 'text-[#2fd9f4]'
  let label = 'LOW'

  if (threat_level === 'Safe') {
    color = '#22c55e'
    textColor = 'text-[#22c55e]'
    label = 'SAFE'
  } else if (threat_level === 'Suspicious') {
    color = '#ffb13b'
    textColor = 'text-[#ffb13b]'
    label = 'WARNING'
  } else if (threat_level === 'Dangerous') {
    color = '#ffb4ab'
    textColor = 'text-[#ffb4ab]'
    label = 'CRITICAL'
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-[#3c494c]/20 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_0_20px_rgba(47,217,244,0.08)] transition-all">
      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
          <h3 className="text-lg font-bold text-[#dde4e5]">Threat Classification</h3>
          <RiskBadge threat_level={threat_level} confidence={confidence} />
        </div>
        <p className="text-[#bbc9cd] text-sm leading-relaxed mb-4">{summary}</p>
        
        {/* Visual score range indicators */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#3c494c]/20 w-full text-[10px] font-mono text-center">
          <div className="flex flex-col">
            <span className="text-[#22c55e] font-semibold">Safe</span>
            <span className="text-[#bbc9cd]/60">0 - 30</span>
          </div>
          <div className="flex flex-col border-x border-[#3c494c]/20">
            <span className="text-[#ffb13b] font-semibold">Suspicious</span>
            <span className="text-[#bbc9cd]/60">31 - 69</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#ffb4ab] font-semibold">Dangerous</span>
            <span className="text-[#bbc9cd]/60">70 - 100</span>
          </div>
        </div>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            className="text-[#1a2122]/60"
            cx="80"
            cy="80"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
          />
          {/* Active progress circle */}
          <circle
            className="transition-all duration-1000 ease-out"
            cx="80"
            cy="80"
            fill="transparent"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tighter ${textColor}`}>{risk_score}</span>
          <span className="text-[9px] font-mono font-semibold text-[#bbc9cd] tracking-wider uppercase">{label}</span>
        </div>
      </div>
    </div>
  )
}
