import React from 'react'

export default function SignalList({ signals }) {
  if (!signals || signals.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center border border-[#3c494c]/20">
        <span className="material-symbols-outlined text-[#22c55e] text-3xl mb-2">verified_user</span>
        <p className="text-[#bbc9cd] text-sm font-medium">No risk signals detected. This target appears clean.</p>
      </div>
    )
  }

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return {
          badge: 'bg-[#2fd9f4]/10 text-[#2fd9f4] border border-[#2fd9f4]/25',
          points: 'text-[#2fd9f4]'
        }
      case 'medium':
        return {
          badge: 'bg-[#ffb13b]/10 text-[#ffb13b] border border-[#ffb13b]/25',
          points: 'text-[#ffb13b]'
        }
      case 'high':
        return {
          badge: 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/25',
          points: 'text-[#ffb4ab]'
        }
      case 'critical':
        return {
          badge: 'bg-[#ff5555]/20 text-[#ff5555] border border-[#ff5555]/40 font-bold',
          points: 'text-[#ff5555]'
        }
      default:
        return {
          badge: 'bg-[#bbc9cd]/10 text-[#bbc9cd] border border-[#bbc9cd]/25',
          points: 'text-[#bbc9cd]'
        }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {signals.map((sig, idx) => {
        const style = getSeverityStyle(sig.severity)
        return (
          <div
            key={idx}
            className="glass-card p-5 rounded-xl border border-[#3c494c]/20 flex flex-col justify-between hover:shadow-[0_0_15px_rgba(47,217,244,0.05)] transition-all duration-300"
          >
            <div className="mb-3">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${style.badge}`}>
                  {sig.severity}
                </span>
                <span className={`font-mono text-xs font-semibold ${style.points}`}>
                  +{sig.points} PTS
                </span>
              </div>
              <h4 className="font-semibold text-sm text-[#dde4e5] mb-1">{sig.signal_name}</h4>
            </div>
            <p className="text-xs text-[#bbc9cd] leading-relaxed">{sig.explanation}</p>
          </div>
        )
      })}
    </div>
  )
}
