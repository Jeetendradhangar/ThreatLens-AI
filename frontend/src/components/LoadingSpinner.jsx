import React from 'react'

export default function LoadingSpinner({ message = 'ANALYZING TARGET...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 min-h-[200px]">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">
        progress_activity
      </span>
      <p className="font-label-caps text-label-caps text-primary tracking-widest text-center animate-pulse">{message.toUpperCase()}</p>
    </div>
  )
}
