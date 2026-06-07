import React, { useState } from 'react'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskScoreCard from '../components/RiskScoreCard'
import SignalList from '../components/SignalList'
import ApiResultsList from '../components/ApiResultsList'
import FeedbackForm from '../components/FeedbackForm'

export default function ScannerPage() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setResult(null)
    setError('')
    setFeedbackSuccess(false)
    setLoading(true)

    try {
      const resp = await api.post('/api/scan/', {
        input_value: inputValue.trim()
      })
      setResult(resp.data)
    } catch (err) {
      setError(err.message || 'An error occurred during scanning. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setInputValue('')
    setResult(null)
    setError('')
    setFeedbackSuccess(false)
  }

  const getRecommendationStyle = (threatLevel) => {
    switch (threatLevel) {
      case 'Safe':
        return 'border-l-4 border-green-500 bg-green-50 text-green-800'
      case 'Suspicious':
        return 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'Dangerous':
        return 'border-l-4 border-red-500 bg-red-50 text-red-800'
      default:
        return 'border-l-4 border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Scan Before You Click
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Enter any URL, domain, or IP address to get an instant risk assessment.
        </p>
      </div>

      {/* Input Section */}
      {!loading && !result && !error && (
        <form onSubmit={handleScan} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <div>
            <label htmlFor="scan-input" className="sr-only">URL or IP address</label>
            <input
              id="scan-input"
              type="text"
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com or 192.168.1.1 or domain.com"
              className="w-full text-lg p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow"
          >
            Scan Now
          </button>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <LoadingSpinner message="Scanning URL... This may take a few seconds." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-4 shadow-sm">
          <span className="text-3xl" role="img" aria-label="error">⚠️</span>
          <p className="text-red-700 font-medium">{error}</p>
          <div>
            <button
              onClick={() => setError('')}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Result Output */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Summary / Assessment Card */}
          <RiskScoreCard
            risk_score={result.risk_score}
            threat_level={result.threat_level}
            confidence={result.confidence}
            summary={result.summary}
          />

          {/* Recommendation Box */}
          <div className={`p-4 rounded-lg shadow-xs ${getRecommendationStyle(result.threat_level)}`}>
            <p className="text-sm">
              <strong className="font-bold mr-1">Recommendation:</strong>
              {result.recommendation}
            </p>
          </div>

          {/* Meta Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs text-xs space-y-1 text-gray-500">
            <p className="break-all"><strong className="text-gray-700">Scanned Value:</strong> {result.input_value}</p>
            {result.normalized_url && <p className="break-all"><strong className="text-gray-700">Normalized:</strong> {result.normalized_url}</p>}
            {result.domain && <p><strong className="text-gray-700">Domain:</strong> {result.domain}</p>}
            {result.ip_address && <p><strong className="text-gray-700">IP:</strong> {result.ip_address}</p>}
          </div>

          {/* Signals panel */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Risk Signals Detected</h3>
            <SignalList signals={result.signals} />
          </div>

          {/* External Reputation Checks */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">External Reputation Checks</h3>
            <ApiResultsList api_results={result.api_results} />
          </div>

          {/* Feedback Section */}
          <div>
            {feedbackSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center text-sm font-medium">
                Thank you for your feedback!
              </div>
            ) : (
              <FeedbackForm
                scan_id={result.id}
                onSuccess={() => setFeedbackSuccess(true)}
              />
            )}
          </div>

          {/* Disclaimer (Priority 7) */}
          <div className="bg-gray-50 border border-gray-200 text-gray-500 p-4 rounded-lg text-center text-xs">
            <span className="font-semibold text-gray-700 block mb-1">⚠️ Disclaimer</span>
            ThreatLens AI provides risk assessment, not a 100% guarantee. Always exercise caution before interacting with unfamiliar URLs.
          </div>

          {/* Scan Another Button */}
          <button
            onClick={handleReset}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-200 text-lg shadow-sm"
          >
            Scan Another URL
          </button>
        </div>
      )}
    </div>
  )
}
