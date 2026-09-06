import { useState } from 'react'
import { downloadReport } from '../api'

const SEVERE_DISEASES = ['AIDS', 'Heart attack', 'Paralysis (brain hemorrhage)', 'Tuberculosis']

export function UserTurn({ symptoms }) {
  return (
    <div className="turn-user">
      <div className="bubble">
        <span className="label">Reported symptoms</span>
        {symptoms.join(', ')}
      </div>
    </div>
  )
}

export function AssistantTurn({ result, loading, symptoms }) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  async function handleDownload() {
    setDownloading(true)
    setDownloadError('')
    try {
      await downloadReport({ symptoms, ...result })
    } catch (err) {
      setDownloadError(err.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="turn-assistant">
        <div className="assistant-card">
          <p className="assistant-loading">Analyzing symptoms…</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  const { predictions, explanation, model_comparison, personalized_recommendations, unmatched_symptoms } = result
  const top = predictions?.[0]
  const rest = predictions?.slice(1) || []
  const isSevere = SEVERE_DISEASES.includes(top?.disease)

  return (
    <div className="turn-assistant">
      <div className="assistant-card">
        {isSevere && (
          <div className="alert-banner">High risk — please consult a doctor immediately. Check the Hospitals tab for care near you.</div>
        )}

        {top && (
          <>
            <div className="top-prediction">
              <span className="disease">{top.disease}</span>
              <span className="confidence">{top.confidence}%</span>
            </div>
            {rest.length > 0 && (
              <p className="other-predictions">
                Also considered: {rest.map((p) => `${p.disease} (${p.confidence}%)`).join(', ')}
              </p>
            )}
          </>
        )}

        {unmatched_symptoms?.length > 0 && (
          <p className="unmatched-note">Not recognized: {unmatched_symptoms.join(', ')}</p>
        )}

        {personalized_recommendations?.length > 0 && (
          <ul className="tips-list" style={{ marginTop: 12 }}>
            {personalized_recommendations.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        )}

        {explanation?.length > 0 && (
          <details className="section">
            <summary>Why this prediction</summary>
            <div className="body">
              {explanation.map((e) => (
                <div className="bar-row" key={e.symptom}>
                  <div className="bar-row-top">
                    <span>{e.symptom}</span>
                    <span>{e.contribution_percent}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${e.contribution_percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {model_comparison && (
          <details className="section">
            <summary>Decision Tree vs Random Forest</summary>
            <div className="body" style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.7 }}>
              Decision Tree predicted <strong style={{ color: 'var(--text)' }}>{model_comparison.decision_tree.disease}</strong> ({model_comparison.decision_tree.confidence}%)<br />
              Random Forest predicted <strong style={{ color: 'var(--text)' }}>{model_comparison.random_forest.disease}</strong> ({model_comparison.random_forest.confidence}%)
            </div>
          </details>
        )}

        <button className="download-report-btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generating PDF…' : 'Download report (PDF)'}
        </button>
        {downloadError && <p className="unmatched-note">{downloadError}</p>}
      </div>
    </div>
  )
}
