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
    if (e) e.preventDefault()
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
        return 'border-l-4 border-[#22c55e] bg-[#22c55e]/10 text-[#dde4e5]'
      case 'Suspicious':
        return 'border-l-4 border-tertiary bg-tertiary/10 text-[#dde4e5]'
      case 'Dangerous':
        return 'border-l-4 border-error bg-error-container/20 text-[#dde4e5]'
      default:
        return 'border-l-4 border-outline bg-surface-container text-[#dde4e5]'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <section className="max-w-[1000px] mx-auto text-center mb-8 sm:mb-16 px-4">
        <h1 className="text-[28px] sm:text-[38px] md:text-display-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container leading-tight">
          Scan Before You Click
        </h1>
        <p className="text-sm sm:text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Real-time URL and IP intelligence to protect your digital footprint from malicious exploits and phishing attempts.
        </p>
      </section>

      {/* Centerpiece Scanner Input / Loader / Error */}
      <section className="max-w-4xl mx-auto relative px-4">
        {/* Animated Pulse Background */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden">
          <div className="w-64 h-64 sm:w-96 sm:h-96 bg-primary/5 rounded-full animate-pulse-ring"></div>
          <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/5 rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="glass-panel rounded-xl p-5 sm:p-8 lg:p-12 relative overflow-hidden">
          {/* Inner Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {loading && (
            <LoadingSpinner message="Running subsurface intelligence scan..." />
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="material-symbols-outlined text-error text-5xl">warning</span>
              <p className="text-error font-medium font-body-md">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-primary hover:underline font-label-caps text-label-caps"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !result && (
            <form onSubmit={handleScan} className="flex flex-col gap-6 sm:gap-8">
              <div className="flex flex-col gap-4 relative">
                <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2" htmlFor="scanner-input">
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  INPUT TARGET FOR ANALYSIS
                </label>
                <div className="flex flex-col sm:relative sm:flex-row gap-3 sm:gap-0">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-primary/50 transition-colors">link</span>
                    </div>
                    <input
                      className="w-full bg-black/40 border border-outline-variant/30 rounded-lg py-4 sm:py-5 pl-12 pr-4 sm:pr-40 text-sm sm:text-body-md font-data-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50 text-on-surface"
                      id="scanner-input"
                      placeholder="Paste suspicious URL or IP address..."
                      type="text"
                      required
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-full sm:w-auto sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 bg-primary text-on-primary-fixed px-6 py-3 sm:py-2.5 rounded font-label-caps text-label-caps font-bold neon-glow-hover transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">security</span>
                    Scan Threat
                  </button>
                </div>
              </div>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="font-label-caps text-label-caps text-on-surface">HTTPS Check</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary">search</span>
                  <span className="font-label-caps text-label-caps text-on-surface">Phishing Keywords</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary">alt_route</span>
                  <span className="font-label-caps text-label-caps text-on-surface">Redirect Analysis</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary">public</span>
                  <span className="font-label-caps text-label-caps text-on-surface">IP Reputation</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 flex items-start gap-2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <p className="font-body-sm text-body-sm italic">Risk assessment only, not a 100% guarantee.</p>
              </div>
            </form>
          )}

          {/* Results Details Block */}
          {result && !loading && !error && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Intelligence Report</span>
                  <span className="h-1 w-1 bg-outline-variant rounded-full"></span>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">ID: TL-{result.id}</span>
                </div>
                <button
                  onClick={handleReset}
                  className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> New Scan
                </button>
              </div>

              {/* Summary / Assessment Card */}
              <RiskScoreCard
                risk_score={result.risk_score}
                threat_level={result.threat_level}
                confidence={result.confidence}
                summary={result.summary}
              />

              {/* Recommendation Box */}
              <div className={`p-4 rounded-xl border border-outline-variant/10 ${getRecommendationStyle(result.threat_level)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">warning</span>
                  <h4 className="font-headline-sm text-sm font-bold uppercase tracking-wider">Recommendation</h4>
                </div>
                <p className="text-sm leading-relaxed">{result.recommendation}</p>
              </div>

              {/* Meta Details */}
              <div className="bg-surface-container/50 p-4 rounded-xl border border-outline-variant/10 text-xs space-y-2 text-on-surface-variant">
                <p className="break-all font-data-mono"><strong className="text-on-surface">Scanned Target:</strong> {result.input_value}</p>
                {result.normalized_url && <p className="break-all font-data-mono"><strong className="text-on-surface">Normalized URL:</strong> {result.normalized_url}</p>}
                {result.domain && <p className="font-data-mono"><strong className="text-on-surface">Registered Domain:</strong> {result.domain}</p>}
                {result.ip_address && <p className="font-data-mono"><strong className="text-on-surface">Resolved IP:</strong> {result.ip_address}</p>}
              </div>

              {/* Signals Panel */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">Risk Signals Detected</h3>
                  <span className="font-data-mono text-xs text-on-surface-variant">{result.signals?.length || 0} Flagged</span>
                </div>
                <SignalList signals={result.signals} />
              </div>

              {/* External Reputation Checks */}
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider mb-3">External Reputation Checks</h3>
                <ApiResultsList api_results={result.api_results} />
              </div>

              {/* Feedback Section */}
              <div>
                {feedbackSuccess ? (
                  <div className="bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] p-4 rounded-xl text-center text-sm font-medium">
                    Thank you for your feedback!
                  </div>
                ) : (
                  <FeedbackForm
                    scan_id={result.id}
                    onSuccess={() => setFeedbackSuccess(true)}
                  />
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-surface-container-low/40 border border-outline-variant/10 text-on-surface-variant/60 p-4 rounded-xl text-center text-xs">
                <span className="font-semibold text-on-surface block mb-1">⚠️ Disclaimer</span>
                ThreatLens AI provides risk assessment and educational threat signals. It is not a 100% guarantee that a URL is safe or malicious. Always use precautions.
              </div>
            </div>
          )}
        </div>

        {/* Bento Grid - Decorative Elements below Centerpiece */}
        {!result && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="glass-panel p-6 rounded-lg flex flex-col gap-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">RECENT SCAN LOAD</span>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary animate-pulse"></div>
              </div>
              <span className="font-data-mono text-body-sm text-primary">82.4% CPU CAPACITY</span>
            </div>
            <div className="glass-panel p-6 rounded-lg flex flex-col gap-2 md:col-span-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">GLOBAL THREAT MAP (ACTIVE)</span>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border border-surface-container-highest bg-error animate-pulse"></div>
                  <div className="w-8 h-8 rounded-full border border-surface-container-highest bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <span className="font-data-mono text-body-sm text-on-surface">Tracking 4,129 malicious entities...</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Decorative UI Element (Floating Intelligence Data) */}
      <div className="hidden lg:block fixed left-10 bottom-32 opacity-20 hover:opacity-100 transition-opacity duration-500">
        <div className="flex flex-col gap-2 font-data-mono text-body-sm">
          <div className="text-primary">&gt; RUNNING_SUBSURFACE_SCAN</div>
          <div className="text-on-surface-variant">ID: 4920-TLX</div>
          <div className="text-on-surface-variant">PORT: 443 OPEN</div>
          <div className="text-on-surface-variant">TTL: 54ms</div>
        </div>
      </div>
    </div>
  )
}
