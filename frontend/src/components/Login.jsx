import { useState } from 'react'
import { login } from '../api'
import { saveToken } from '../auth'

export default function Login({ onSuccess, onSwitchToRegister, initialEmail = '', successMessage = '' }) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      saveToken(data.token)
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M1 14H8L11 5L16 23L19 14H27" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>MedAssist AI</h1>
        </div>
        <p className="auth-subtitle">Log in to continue to your dashboard.</p>
        {successMessage && <p className="auth-success">{successMessage}</p>}

        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister}>Register</button>
        </p>
      </form>
    </div>
  )
}
