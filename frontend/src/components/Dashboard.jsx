import { useState, useRef, useEffect } from 'react'
import { Activity } from 'lucide-react'
import Topbar from './Topbar'
import Composer from './Composer'
import { UserTurn, AssistantTurn } from './ChatMessage'
import HistoryPanel from './HistoryPanel'
import AnalyticsPanel from './AnalyticsPanel'
import HospitalPanel from './HospitalPanel'
import HomePanel from './HomePanel'
import ProfilePanel from './ProfilePanel'
import { predictDisease } from '../api'

export default function Dashboard({ session, onProfileUpdated, onLogout }) {
  const [tab, setTab] = useState('home')
  const [symptoms, setSymptoms] = useState([])
  const [turns, setTurns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const feedRef = useRef(null)

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, loading])

  function addSymptom(s) {
    const normalized = s.trim().toLowerCase()
    if (!symptoms.includes(normalized)) setSymptoms([...symptoms, normalized])
  }

  function quickStart(list) {
    setSymptoms(list)
  }

  function removeSymptom(s) {
    setSymptoms(symptoms.filter((sym) => sym !== s))
  }

  async function handleSend() {
    if (symptoms.length === 0) return
    const sentSymptoms = symptoms
    setTurns((t) => [...t, { type: 'user', symptoms: sentSymptoms }])
    setSymptoms([])
    setLoading(true)
    setError('')
    try {
      const data = await predictDisease(sentSymptoms)
      setTurns((t) => [...t, { type: 'assistant', result: data, symptoms: sentSymptoms }])
    } catch (err) {
      setError(err.message || 'Could not reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Topbar userId={session.userId} tab={tab} setTab={setTab} onLogout={onLogout} />

      <main className="workspace">
        {tab === 'home' && <HomePanel session={session} setTab={setTab} />}

        {tab === 'chat' && (
          <>
            <p className="page-eyebrow">Check now</p>
            <h1 className="page-title">Symptom checker</h1>
            <p className="page-subtitle">Add what you're experiencing, one at a time, then run a check.</p>

            <div className="chat-layout">
              <div className="panel symptom-panel">
                <Composer symptoms={symptoms} onAdd={addSymptom} onRemove={removeSymptom} onSend={handleSend} loading={loading} />
                {error && <p className="error-note">{error}</p>}
              </div>

              <div className="results-feed" ref={feedRef}>
                {turns.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Activity size={20} /></div>
                    <p className="welcome">
                      <strong>Run a check.</strong> Results will appear here — a ranked prediction, an
                      explanation of why, and advice personalized to your profile.
                    </p>
                    <div className="quick-start">
                      <button className="quick-start-chip" onClick={() => quickStart(['high_fever', 'headache', 'fatigue'])}>Try: fever + headache</button>
                      <button className="quick-start-chip" onClick={() => quickStart(['itching', 'skin_rash', 'nodal_skin_eruptions'])}>Try: skin symptoms</button>
                      <button className="quick-start-chip" onClick={() => quickStart(['cough', 'chest_pain', 'breathlessness'])}>Try: respiratory symptoms</button>
                    </div>
                  </div>
                )}
                {turns.map((turn, i) =>
                  turn.type === 'user'
                    ? <UserTurn key={i} symptoms={turn.symptoms} />
                    : <AssistantTurn key={i} result={turn.result} symptoms={turn.symptoms} />
                )}
                {loading && <AssistantTurn loading />}
              </div>
            </div>
          </>
        )}

        {tab === 'history' && (
          <>
            <p className="page-eyebrow">Records</p>
            <h1 className="page-title">Prediction history</h1>
            <p className="page-subtitle">Every check you've run, searchable and filterable.</p>
            <div className="panel history-panel"><HistoryPanel /></div>
          </>
        )}

        {tab === 'analytics' && (
          <>
            <p className="page-eyebrow">Insights</p>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Trends across everything you've checked so far.</p>
            <div className="analytics-panel"><AnalyticsPanel /></div>
          </>
        )}

        {tab === 'hospitals' && (
          <>
            <p className="page-eyebrow">Nearby care</p>
            <h1 className="page-title">Hospitals &amp; clinics</h1>
            <p className="page-subtitle">Find medical help near you, using OpenStreetMap data.</p>
            <div className="panel hospital-panel"><HospitalPanel /></div>
          </>
        )}

        {tab === 'profile' && (
          <ProfilePanel
            profile={session.profile}
            bmi={session.bmi}
            bmiCategory={session.bmiCategory}
            onProfileUpdated={onProfileUpdated}
          />
        )}
      </main>
    </div>
  )
}
