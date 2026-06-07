import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskScoreCard from '../components/RiskScoreCard'
import SignalList from '../components/SignalList'
import ApiResultsList from '../components/ApiResultsList'
import FeedbackForm from '../components/FeedbackForm'

export default function ReportPage() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  useEffect(() => {
    const fetchScanDetail = async () => {
      try {
        const resp = await api.get(`/api/scans/${scanId}/`)
        setScan(resp.data)
      } catch (err) {
        setError(err.message || `Failed to fetch report for scan ID ${scanId}.`)
      } finally {
        setLoading(false)
      }
    }
    fetchScanDetail()
  }, [scanId])

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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <LoadingSpinner message="Loading report..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-4 shadow-sm">
          <span className="text-3xl" role="img" aria-label="error">⚠️</span>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start"
        >
          ← Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-200 pb-3">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Scan Report #{scan.id}
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            {new Date(scan.scanned_at).toLocaleString(undefined, {
              dateStyle: 'full',
              timeStyle: 'medium'
            })}
          </p>
        </div>
      </div>

      {/* Main Score Board */}
      <RiskScoreCard
        risk_score={scan.risk_score}
        threat_level={scan.threat_level}
        confidence={scan.confidence}
        summary={scan.summary}
      />

      {/* Recommendation alert box */}
      <div className={`p-4 rounded-lg shadow-xs ${getRecommendationStyle(scan.threat_level)}`}>
        <p className="text-sm">
          <strong className="font-bold mr-1">Recommendation:</strong>
          {scan.recommendation}
        </p>
      </div>

      {/* Target Technical Details */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">Scanned Target Information</h3>
        <div className="space-y-3">
          <div>
            <span className="block text-xs font-semibold text-gray-500 mb-1">Normalized URL</span>
            <div className="bg-gray-50 font-mono text-xs text-gray-800 p-3 rounded-lg border border-gray-100 break-all select-all">
              {scan.normalized_url}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scan.domain && (
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-0.5">Registered Domain</span>
                <span className="text-sm font-medium text-gray-800 font-mono">{scan.domain}</span>
              </div>
            )}
            {scan.ip_address && (
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-0.5">IP Address</span>
                <span className="text-sm font-medium text-gray-800 font-mono">{scan.ip_address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Risk Signals</h3>
        <SignalList signals={scan.signals} />
      </div>

      {/* API Reputation Checks */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">External Reputation Checks</h3>
        <ApiResultsList api_results={scan.api_results} />
      </div>

      {/* Feedback Section */}
      <div>
        {feedbackSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center text-sm font-medium">
            Thank you for your feedback!
          </div>
        ) : (
          <FeedbackForm
            scan_id={scan.id}
            onSuccess={() => setFeedbackSuccess(true)}
          />
        )}
      </div>

      {/* Disclaimer (Priority 7) */}
      <div className="bg-gray-50 border border-gray-200 text-gray-500 p-4 rounded-lg text-center text-xs">
        <span className="font-semibold text-gray-700 block mb-1">⚠️ Disclaimer</span>
        ThreatLens AI provides risk assessment, not a 100% guarantee. Always exercise caution before interacting with unfamiliar URLs.
      </div>

      {/* Scan another target action */}
      <button
        onClick={() => navigate('/scan')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-lg shadow"
      >
        Scan Another URL
      </button>
    </div>
  )
}
