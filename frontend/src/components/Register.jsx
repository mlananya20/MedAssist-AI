import { useState } from 'react'
import { register } from '../api'

export default function Register({ onRegistered, onSwitchToLogin }) {
  const [form, setForm] = useState({
    email: '', password: '', age: '', gender: 'female',
    height_cm: '', weight_kg: '', allergies: '', medical_history: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        email: form.email,
        password: form.password,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        allergies: form.allergies,
        medical_history: form.medical_history,
      }
      const data = await register(payload)
      onRegistered(data.user_id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
        <div className="brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M1 14H8L11 5L16 23L19 14H27" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>MedAssist AI</h1>
        </div>
        <p className="auth-subtitle">Create your account and health profile in one step.</p>

        <div className="auth-grid">
          <div className="full">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="full">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" />
          </div>

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

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin}>Log in</button>
        </p>
      </form>
    </div>
  )
}
