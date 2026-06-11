import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'
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
        return 'border-[#22c55e]/30 bg-[#22c55e]/10 text-on-surface'
      case 'Suspicious':
        return 'border-tertiary/30 bg-tertiary/10 text-on-surface'
      case 'Dangerous':
        return 'border-error/30 bg-error-container/20 text-on-surface'
      default:
        return 'border-outline-variant/30 bg-surface-container text-on-surface'
    }
  }

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 max-w-4xl mx-auto mt-12">
        <LoadingSpinner message="Generating automated threat intelligence report..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> BACK TO CORES
        </button>
        <div className="glass-panel p-8 rounded-xl border border-error/30 text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-error text-5xl">warning</span>
          <p className="text-error font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="max-w-4xl mx-auto mt-12 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
        </button>
        <div className="glass-panel p-8 rounded-xl border border-error/30 text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-error text-5xl">warning</span>
          <p className="text-error font-medium">Report data is not available or corrupt.</p>
        </div>
      </div>
    )
  }

  // Calculate dynamic circular progress gauge
  const radius = 88
  const circumference = 2 * Math.PI * radius // ~552.92
  const progressOffset = circumference - (Math.max(0, Math.min(100, scan.risk_score || 0)) / 100) * circumference

  let threatColor = '#2fd9f4'
  let labelText = 'UNKNOWN'
  let textColorClass = 'text-primary'
  let badgeStyle = 'bg-surface-container text-on-surface-variant'

  if (scan.threat_level === 'Safe') {
    threatColor = '#22c55e'
    labelText = 'SAFE'
    textColorClass = 'text-[#22c55e]'
    badgeStyle = 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
  } else if (scan.threat_level === 'Suspicious') {
    threatColor = '#ffb13b'
    labelText = 'SUSPICIOUS'
    textColorClass = 'text-tertiary'
    badgeStyle = 'bg-tertiary/10 text-tertiary border border-tertiary/20'
  } else if (scan.threat_level === 'Dangerous') {
    threatColor = '#ffb4ab'
    labelText = 'DANGEROUS'
    textColorClass = 'text-error'
    badgeStyle = 'bg-error-container text-on-error-container border border-error/20 animate-pulse'
  }

  // Dynamic calculation of risk breakdown scores based on actual signals
  const signals = scan.signals || []
  const apiResults = scan.api_results || []

  let linguisticScore = 0
  let infraScore = 0
  let whoisScore = 0
  let sandboxScore = 0

  signals.forEach(sig => {
    const name = sig.signal_name || ""
    const pts = sig.points || 0

    if (
      name.includes("keyword") ||
      name.includes("Punycode") ||
      name.includes("long domain") ||
      name.includes("hyphen") ||
      name.includes("Urgency") ||
      name.includes("phrase") ||
      name.includes("long URL")
    ) {
      linguisticScore += pts
    } else if (
      name.includes("HTTPS") ||
      name.includes("Raw IP") ||
      name.includes("Internal/private")
    ) {
      infraScore += pts
    } else if (
      name.includes("shortener") ||
      name.includes("subdomains")
    ) {
      whoisScore += pts
    } else if (
      name.includes("redirects")
    ) {
      sandboxScore += pts
    } else {
      linguisticScore += pts
    }
  })

  // Add points to Infrastructure Reputation from external API feeds
  apiResults.forEach(apiRes => {
    if (apiRes.status === "malicious") {
      infraScore += 40
    } else if (apiRes.status === "suspicious") {
      infraScore += 20
    }
  })

  // Safe scans (risk_score = 0) must have 0 across all categories
  const linguisticBreakdown = scan.risk_score === 0 ? 0 : Math.min(100, linguisticScore)
  const infraBreakdown = scan.risk_score === 0 ? 0 : Math.min(100, infraScore)
  const whoisBreakdown = scan.risk_score === 0 ? 0 : Math.min(100, whoisScore)
  const sandboxBreakdown = scan.risk_score === 0 ? 0 : Math.min(100, sandboxScore)

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <button
        onClick={() => navigate(-1)}
        className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1 self-start"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
      </button>

      {/* Main Report Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Intelligence Report</span>
            <span className="h-1 w-1 bg-outline-variant rounded-full"></span>
            <span className="font-data-mono text-data-mono text-on-surface-variant">ID: TL-{scan.id}</span>
          </div>
          <h1 className="font-headline-lg text-[22px] lg:text-headline-lg cyber-glow flex items-center gap-3 break-all text-on-surface">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
            {scan.input_value}
          </h1>
        </div>
        <div className="text-right">
          <p className="font-data-mono text-data-mono text-on-surface-variant text-xs">
            Timestamp: {scan.scanned_at ? new Date(scan.scanned_at).toUTCString() : 'Unknown Date'}
          </p>
          <p className="font-data-mono text-data-mono text-primary text-xs mt-1">
            Status: Telemetry Synchronized
          </p>
        </div>
      </header>

      {/* Grid Layout: Sidebar & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
          {/* Risk Score Circle */}
          <section className="glass-card p-stack-lg rounded-xl flex flex-col items-center text-center">
            <h2 className="font-headline-sm text-headline-sm mb-4">Total Risk Score</h2>
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle
                  className="text-surface-container-highest"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="risk-ring transition-all duration-1000 ease-out"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r={radius}
                  stroke={threatColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display-lg text-[42px] font-bold ${textColorClass}`}>{scan.risk_score}</span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">{labelText}</span>
              </div>
            </div>
            
            <div className={`px-6 py-2 rounded-full font-label-caps text-label-caps ${badgeStyle}`}>
              {scan.threat_level?.toUpperCase()}
            </div>
            
            <div className="flex items-center gap-2 text-primary font-body-sm mt-4">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="font-label-caps text-[10px] uppercase font-semibold">
                Engine confidence: {scan.threat_level === 'Safe' ? 'Clean Result' : `${scan.confidence || 'Medium'} Confidence`}
              </span>
            </div>
          </section>

          {/* Recommendation Box */}
          <section className={`border p-stack-md rounded-xl ${getRecommendationStyle(scan.threat_level)}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider">Recommendation</h3>
            </div>
            <p className="font-body-md text-xs leading-relaxed text-on-surface mb-6">
              {scan.recommendation}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => alert('Blocklist telemetry updated for router node.')}
                className="w-full bg-error text-on-error font-label-caps text-label-caps py-2 rounded hover:opacity-90 transition-opacity font-bold"
              >
                Add to Blocklist
              </button>
              <button
                onClick={() => alert('Incident log pushed to local SIEM dashboard.')}
                className="w-full border border-outline-variant/30 text-on-surface font-label-caps text-label-caps py-2 rounded hover:bg-surface-container-highest transition-colors"
              >
                Generate SIEM Alert
              </button>
            </div>
          </section>

          {/* Feedback Form */}
          <section>
            {feedbackSuccess ? (
              <div className="bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] p-4 rounded-xl text-center text-sm font-medium">
                Thank you for your feedback!
              </div>
            ) : (
              <FeedbackForm
                scan_id={scan.id}
                onSuccess={() => setFeedbackSuccess(true)}
              />
            )}
          </section>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-stack-lg">
          {/* Target Technical Details */}
          <section className="glass-card p-6 rounded-xl border border-outline-variant/20">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wider">Target Domain Metrics</h3>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Normalized Target URL</span>
                <div className="bg-surface-container-lowest font-data-mono text-xs text-on-surface p-3 rounded-lg border border-outline-variant/20 break-all select-all">
                  {scan.normalized_url || scan.input_value}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scan.domain && (
                  <div>
                    <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Registered Domain</span>
                    <span className="text-sm font-semibold text-primary font-data-mono">{scan.domain}</span>
                  </div>
                )}
                {scan.ip_address && (
                  <div>
                    <span className="block text-[10px] font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">IP Address Target</span>
                    <span className="text-sm font-semibold text-primary font-data-mono">{scan.ip_address}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Risk Signals Detected */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-sm">Risk Signals Detected</h2>
              <span className="font-data-mono text-xs text-on-surface-variant">{(scan.signals && scan.signals.length) || 0} Flagged</span>
            </div>
            <SignalList signals={scan.signals} />
          </section>

          {/* Score Breakdown (Gauges) */}
          <section className="glass-card p-stack-lg rounded-xl">
            <h2 className="font-headline-md text-headline-sm mb-6">Score Category Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span>Linguistic Analysis</span>
                  <span>{linguisticBreakdown}/100</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-error h-full transition-all duration-1000" style={{ width: `${linguisticBreakdown}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span>Infrastructure Reputation</span>
                  <span>{infraBreakdown}/100</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full transition-all duration-1000" style={{ width: `${infraBreakdown}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span>WHOIS Maturity</span>
                  <span>{whoisBreakdown}/100</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${whoisBreakdown}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span>Content Sandbox Analysis</span>
                  <span>{sandboxBreakdown}/100</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full transition-all duration-1000" style={{ width: `${sandboxBreakdown}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Threat Intel API Results */}
          <section className="space-y-3">
            <h2 className="font-headline-md text-headline-sm">Threat Intel Provider Feeds</h2>
            <ApiResultsList api_results={scan.api_results} />
          </section>

          {/* Sandbox Visual Component */}
          <section className="glass-card rounded-xl overflow-hidden border border-outline-variant/20">
            <div className="bg-surface-container-high px-4 py-2.5 border-b border-outline-variant/10 flex justify-between items-center">
              <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant font-bold">Sandbox Viewport Rendering</span>
              <span className="text-primary text-[10px] font-label-caps uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">shield</span> SECURE NODE
              </span>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <img
                alt="Threat Analysis View"
                className="w-full h-full object-cover opacity-40"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT1NApL_RDQ_RU7u5Gc8aOpcOzrz0gdnuE3ELjZKRxkmxvcBymjYb1z8Gyn9FzmaLgci7do_ciqLyn4dcdaYQus-Z_tLSEZ6_rEvsvwvx9A31cgXEucyhv_nB3k7Ui7QxU55yp4h7zWnuRh9uBvjlfkHITK1EIvR8oTS-Q2QTk2qnd1mvIiyQry1OTKSdWZkBw1OwlEhFMMH7BFlw1OTYbdxkxB8Spqmt0hPshPMKIvkaaqy3yooEeD69VKV5YtHfvdjCG7RD2X-Y"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute flex flex-col items-center text-center px-4">
                <span className="material-symbols-outlined text-error text-5xl mb-2 animate-pulse">security_update_warning</span>
                <p className="font-data-mono text-data-mono text-error font-bold tracking-wider">LIVE EXECUTION ISOLATED</p>
                <p className="text-[10px] text-on-surface-variant/80 font-data-mono mt-1">Virtual environment prevented local script interaction.</p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-surface-container-low/30 border border-outline-variant/10 text-on-surface-variant/60 p-4 rounded-xl text-center text-xs">
            <span className="font-semibold text-on-surface block mb-1">⚠️ Disclaimer</span>
            ThreatLens AI provides risk assessment and educational threat signals. It is not a 100% guarantee that a URL is safe or malicious. Always use precautions.
          </div>
        </div>
      </div>
    </div>
  )
}
