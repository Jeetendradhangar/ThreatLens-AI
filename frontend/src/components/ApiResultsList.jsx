import React from 'react'

export default function ApiResultsList({ api_results }) {
  if (!api_results || api_results.length === 0) {
    return null
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'clean':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'malicious':
        return 'bg-red-100 text-red-800 border border-red-200 font-semibold'
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'skipped':
        return 'bg-gray-100 text-gray-600 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
      {api_results.map((res, idx) => (
        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-gray-950">{res.provider}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getStatusBadge(res.status)}`}>
              {res.status}
            </span>
          </div>
          <div className="text-xs text-gray-500 italic max-w-md break-all">
            {res.raw_summary}
          </div>
        </div>
      ))}
    </div>
  )
}
