import React, { useState } from 'react'
import api from '../api/axiosInstance'

export default function FeedbackForm({ scan_id, onSuccess }) {
  const [selectedRating, setSelectedRating] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ratingOptions = [
    { label: 'Helpful', value: 'helpful', icon: 'thumb_up' },
    { label: 'Not Helpful', value: 'not_helpful', icon: 'thumb_down' },
    { label: 'False Positive', value: 'false_positive', icon: 'verified_user' },
    { label: 'False Negative', value: 'false_negative', icon: 'bug_report' }
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
      <div className="bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] p-4 rounded-xl text-center text-sm font-medium">
        Thank you for your feedback! Your submission helps improve our threat intelligence engine.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 rounded-xl border border-outline-variant/20 flex flex-col gap-4">
      <div>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3">
          Was this result helpful?
        </h3>
        
        {/* Styled Radio Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {ratingOptions.map((opt) => {
            const isSelected = selectedRating === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRating(opt.value)}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-[0_0_10px_rgba(47,217,244,0.15)]'
                    : 'border-outline-variant/20 text-on-surface hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-2">
          Additional comments (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add analyst notes or feedback details..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded p-3 text-body-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none h-20 text-on-surface placeholder:text-outline-variant/50"
        />
      </div>

      {error && (
        <div className="text-error text-xs bg-error-container/20 p-3 rounded-lg border border-error/30">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedRating || loading}
        className="w-full bg-primary-container text-on-primary-container font-label-caps text-label-caps py-2.5 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(47,217,244,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}
