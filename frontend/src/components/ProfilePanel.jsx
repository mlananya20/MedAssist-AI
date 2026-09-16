import { useState } from 'react'
import { saveProfile } from '../api'

export default function ProfilePanel({ profile, bmi, bmiCategory, onProfileUpdated }) {
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
    } catch (err) {
      setStatus('Could not save')
    }
  }

  return (
    <>
      <p className="page-eyebrow">Account</p>
      <h1 className="page-title">Your profile</h1>
      <p className="page-subtitle">These details personalize every prediction MedAssist AI gives you.</p>

      {bmi && <div className="bmi-chip">BMI {bmi} · {bmiCategory}</div>}

      <div className="panel">
        <div className="profile-page-grid">
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
          <div>
            <label>Height (cm)</label>
            <input type="number" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} />
          </div>
          <div>
            <label>Weight (kg)</label>
            <input type="number" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} />
          </div>
          <div className="full">
            <label>Allergies</label>
            <input type="text" placeholder="e.g. penicillin, none" value={form.allergies} onChange={(e) => update('allergies', e.target.value)} />
          </div>
          <div className="full">
            <label>Medical history</label>
            <input type="text" placeholder="e.g. asthma, none" value={form.medical_history} onChange={(e) => update('medical_history', e.target.value)} />
          </div>
        </div>
        <button className="save-profile-btn" onClick={handleSave}>Save changes</button>
        {status && <p className="hint" style={{ marginTop: 10, marginBottom: 0 }}>{status}</p>}
      </div>
    </>
  )
}
