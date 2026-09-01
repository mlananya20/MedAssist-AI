import { useState, useEffect } from 'react'
import { fetchHistory } from '../api'

function toCSV(history) {
  const header = ['Date', 'Symptoms', 'Top Disease', 'Confidence']
  const rows = history.map((h) => [
    new Date(h.created_at + 'Z').toLocaleString(),
    h.symptoms.join('; '),
    h.top_disease,
    `${h.confidence}%`,
  ])
  return [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(history) {
  const csv = toCSV(history)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medassist_prediction_history.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function HistoryPanel() {
  const [history, setHistory] = useState([])
  const [diseases, setDiseases] = useState([])
  const [search, setSearch] = useState('')
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchHistory({ disease: diseaseFilter, search })
      setHistory(data.history)
      setDiseases(data.diseases)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [diseaseFilter])

  function handleSearchSubmit(e) {
    e.preventDefault()
    load()
  }

  return (
    <div className="history-panel">
      <div className="history-controls">
        <form onSubmit={handleSearchSubmit} className="history-search">
          <input
            type="text"
            placeholder="Search symptoms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)}>
          <option value="">All diseases</option>
          {diseases.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <button
          className="download-btn"
          onClick={() => downloadCSV(history)}
          disabled={history.length === 0}
        >
          Download CSV
        </button>
      </div>

      {error && <p className="error-note">{error}</p>}
      {loading && <p className="welcome">Loading history…</p>}

      {!loading && history.length === 0 && (
        <p className="welcome">No predictions yet — run one from the Chat tab and it'll show up here.</p>
      )}

      <div className="history-list">
        {history.map((h) => (
          <div className="history-item" key={h.id}>
            <div className="history-item-top">
              <span className="history-disease">{h.top_disease}</span>
              <span className="history-confidence">{h.confidence}%</span>
            </div>
            <p className="history-symptoms">{h.symptoms.join(', ')}</p>
            <p className="history-date">{new Date(h.created_at + 'Z').toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
