import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 min-h-[200px]">
      <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10"></div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  )
}
