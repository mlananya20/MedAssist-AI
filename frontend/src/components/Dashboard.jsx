import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import Composer from './Composer'
import { UserTurn, AssistantTurn } from './ChatMessage'
import HistoryPanel from './HistoryPanel'
import AnalyticsPanel from './AnalyticsPanel'
import HospitalPanel from './HospitalPanel'
import { predictDisease } from '../api'

export default function Dashboard({ session, onProfileUpdated, onLogout }) {
  const [tab, setTab] = useState('chat') // chat | history
  const [symptoms, setSymptoms] = useState([])
  const [turns, setTurns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const transcriptRef = useRef(null)

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, loading])

  function addSymptom(s) {
    const normalized = s.trim().toLowerCase()
    if (!symptoms.includes(normalized)) setSymptoms([...symptoms, normalized])
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
    <div className="shell">
      <Sidebar
        userId={session.userId}
        profile={session.profile}
        bmi={session.bmi}
        bmiCategory={session.bmiCategory}
        onProfileUpdated={onProfileUpdated}
        onLogout={onLogout}
      />

      <div className="chat-area">
        <div className="tab-bar">
          <button className={tab === 'chat' ? 'tab active' : 'tab'} onClick={() => setTab('chat')}>Chat</button>
          <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>History</button>
          <button className={tab === 'analytics' ? 'tab active' : 'tab'} onClick={() => setTab('analytics')}>Analytics</button>
          <button className={tab === 'hospitals' ? 'tab active' : 'tab'} onClick={() => setTab('hospitals')}>Hospitals</button>
        </div>

        {tab === 'history' ? (
          <HistoryPanel />
        ) : tab === 'analytics' ? (
          <AnalyticsPanel />
        ) : tab === 'hospitals' ? (
          <HospitalPanel />
        ) : (
          <>
            <div className="transcript" ref={transcriptRef}>
              {turns.length === 0 && (
                <p className="welcome">
                  <strong>Welcome back.</strong> Describe your symptoms below and MedAssist will return
                  a ranked prediction, an explanation of why, and advice personalized to your profile.
                </p>
              )}
              {turns.map((turn, i) =>
                turn.type === 'user'
                  ? <UserTurn key={i} symptoms={turn.symptoms} />
                  : <AssistantTurn key={i} result={turn.result} symptoms={turn.symptoms} />
              )}
              {loading && <AssistantTurn loading />}
            </div>

            <Composer symptoms={symptoms} onAdd={addSymptom} onRemove={removeSymptom} onSend={handleSend} loading={loading} />
            {error && <p className="error-note" style={{ padding: '0 28px 14px' }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
