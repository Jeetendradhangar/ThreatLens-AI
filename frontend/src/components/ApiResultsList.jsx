import React from 'react'

export default function ApiResultsList({ api_results }) {
  if (!api_results || api_results.length === 0) {
    return null
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'clean':
        return {
          text: 'text-[#22c55e]',
          badge: 'bg-[#22c55e]/10 text-[#22c55e] border-emerald-500/20'
        }
      case 'malicious':
        return {
          text: 'text-error',
          badge: 'bg-error-container/20 text-error border-error/20 font-bold'
        }
      case 'suspicious':
        return {
          text: 'text-tertiary',
          badge: 'bg-tertiary/10 text-tertiary border-tertiary/20'
        }
      case 'error':
        return {
          text: 'text-error/80',
          badge: 'bg-error-container/10 text-error/80 border-error/10'
        }
      case 'skipped':
        return {
          text: 'text-on-surface-variant/70',
          badge: 'bg-surface-container-high/40 text-on-surface-variant/70 border-outline-variant/10'
        }
      default:
        return {
          text: 'text-on-surface',
          badge: 'bg-surface-container/40 text-on-surface border-outline-variant/10'
        }
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {api_results.map((res, idx) => {
        const style = getStatusStyle(res.status)
        return (
          <div key={idx} className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex flex-col justify-between hover:border-primary/45 hover:shadow-[0_0_15px_rgba(47,217,244,0.08)] transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">dns</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">{res.provider}</span>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${style.badge}`}>
                {res.status}
              </span>
            </div>
            <div className={`text-headline-sm font-bold ${style.text} mt-2 mb-1`}>
              {res.status?.toUpperCase()}
            </div>
            <div className="text-xs text-on-surface-variant/85 italic break-words mt-1" title={res.raw_summary}>
              {res.raw_summary || 'No detailed summary provided.'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
