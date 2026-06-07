import React, { useState } from 'react'
import api from '../api/axiosInstance'

export default function FeedbackForm({ scan_id, onSuccess }) {
  const [selectedRating, setSelectedRating] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ratingOptions = [
    { label: 'Helpful', value: 'helpful' },
    { label: 'Not Helpful', value: 'not_helpful' },
    { label: 'False Positive (was actually safe)', value: 'false_positive' },
    { label: 'False Negative (missed a threat)', value: 'false_negative' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRating) return

    setLoading(true)
    setError('')

    try {
      await api.post('/api/feedback/', {
        scan_id,
        user_rating: selectedRating,
        comment: comment.trim()
      })
      setSubmitted(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center text-sm font-medium">
        Thank you for your feedback! Your submission helps improve our threat intelligence engine.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Was this result helpful?
        </label>
        
        {/* Styled Radio Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ratingOptions.map((opt) => {
            const isSelected = selectedRating === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRating(opt.value)}
                className={`text-left p-3 text-sm rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-medium'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
          Additional comments (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Let us know what we did right or wrong..."
          className="w-full text-sm p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedRating || loading}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}
