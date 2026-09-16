import { useEffect, useState } from 'react'
import { Stethoscope, BarChart3, Droplet, FileText, MessageSquare, History, MapPin, ArrowRight } from 'lucide-react'
import { fetchAnalytics, fetchHistory } from '../api'

export default function HomePanel({ session, setTab }) {
  const [analytics, setAnalytics] = useState(null)
  const [latest, setLatest] = useState(null)

  useEffect(() => {
    fetchAnalytics().then(setAnalytics).catch(() => {})
    fetchHistory({}).then((data) => setLatest(data.history?.[0] || null)).catch(() => {})
  }, [])

  const displayName = session.userId ? session.userId.split('@')[0] : 'there'

  return (
    <>
      <p className="page-eyebrow">Welcome back</p>
      <h1 className="page-title">Hello, {displayName} 👋</h1>
      <p className="page-subtitle">Here's a snapshot of your health today.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Stethoscope size={17} /></div>
          <p className="stat-label">Total checks</p>
          <p className="stat-value">{analytics ? analytics.total_predictions : '—'}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BarChart3 size={17} /></div>
          <p className="stat-label">Avg. confidence</p>
          <p className="stat-value">{analytics ? `${analytics.average_confidence}%` : '—'}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Droplet size={17} /></div>
          <p className="stat-label">Your BMI</p>
          <p className="stat-value">{session.bmi ?? '—'}</p>
          {session.bmiCategory && <p className="stat-sub">{session.bmiCategory}</p>}
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FileText size={17} /></div>
          <p className="stat-label">Latest check</p>
          <p className="stat-value" style={{ fontSize: 15 }}>{latest ? latest.top_disease : 'No checks yet'}</p>
        </div>
      </div>

      <p className="section-heading">Quick actions</p>
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => setTab('chat')}>
          <MessageSquare size={16} /> Check symptoms
        </button>
        <button className="quick-action-btn" onClick={() => setTab('history')}>
          <History size={16} /> View history
        </button>
        <button className="quick-action-btn" onClick={() => setTab('analytics')}>
          <BarChart3 size={16} /> See analytics
        </button>
        <button className="quick-action-btn" onClick={() => setTab('hospitals')}>
          <MapPin size={16} /> Find hospitals
        </button>
      </div>

      <div className="cta-banner">
        <div>
          <h3>Feeling unwell right now?</h3>
          <p>Describe your symptoms and get a prediction in under a minute.</p>
        </div>
        <button onClick={() => setTab('chat')}>
          Start a check <ArrowRight size={15} />
        </button>
      </div>

      <p className="disclaimer-note">
        MedAssist AI provides educational predictions from a machine learning model trained on a
        synthetic dataset. It is not a medical diagnosis — please consult a licensed physician for
        any health concerns.
      </p>
    </>
  )
}
