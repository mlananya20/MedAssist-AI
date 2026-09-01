import { useState } from 'react'
import { saveProfile } from '../api'

function WaveformMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M1 14H8L11 5L16 23L19 14H27" stroke="#5FD9B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Sidebar({ userId, profile, bmi, bmiCategory, onProfileUpdated, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    age: profile?.age ?? '',
    gender: profile?.gender ?? 'female',
    height_cm: profile?.height_cm ?? '',
    weight_kg: profile?.weight_kg ?? '',
    allergies: profile?.allergies ?? '',
    medical_history: profile?.medical_history ?? '',
  })
  const [status, setStatus] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setStatus('Saving…')
    try {
      const payload = {
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        allergies: form.allergies,
        medical_history: form.medical_history,
      }
      const data = await saveProfile(payload)
      setStatus('Saved')
      onProfileUpdated?.(data.profile, data.bmi, data.bmi_category)
      setEditing(false)
    } catch (err) {
      setStatus('Could not save')
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <WaveformMark />
        <h1>MedAssist AI</h1>
      </div>
      <p className="brand-tagline">{userId}</p>

      {bmi && (
        <div className="bmi-badge">
          BMI <strong>{bmi}</strong> · {bmiCategory}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button className="link-btn" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit health profile'}
        </button>
      </div>

      {editing && (
        <div className="profile-form" style={{ marginTop: 14 }}>
          <div className="profile-row">
            <div>
              <label>Age</label>
              <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} />
            </div>
            <div>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="profile-row">
            <div>
              <label>Height (cm)</label>
              <input type="number" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} />
            </div>
            <div>
              <label>Weight (kg)</label>
              <input type="number" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} />
            </div>
          </div>
          <div>
            <label>Allergies</label>
            <input type="text" value={form.allergies} onChange={(e) => update('allergies', e.target.value)} />
          </div>
          <div>
            <label>Medical history</label>
            <input type="text" value={form.medical_history} onChange={(e) => update('medical_history', e.target.value)} />
          </div>
          <button className="save-profile-btn" onClick={handleSave}>Save changes</button>
          {status && <p className="hint" style={{ marginTop: 2, marginBottom: 0 }}>{status}</p>}
        </div>
      )}

      <button className="logout-btn" onClick={onLogout}>Log out</button>
    </aside>
  )
}
