import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { getToken, clearToken } from './auth'
import { fetchProfile } from './api'

export default function App() {
  const [view, setView] = useState('checking') // checking | login | register | dashboard
  const [session, setSession] = useState(null) // { userId, profile, bmi, bmiCategory }
  const [registeredEmail, setRegisteredEmail] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setView('login')
      return
    }
    // Token exists — verify it's still valid by fetching the profile
    fetchProfile()
      .then((data) => {
        setSession({ userId: data.profile?.user_id, profile: data.profile, bmi: data.bmi, bmiCategory: data.bmi_category })
        setView('dashboard')
      })
      .catch(() => {
        clearToken()
        setView('login')
      })
  }, [])

  function handleAuthSuccess(data) {
    setSession({ userId: data.user_id, profile: data.profile, bmi: data.bmi, bmiCategory: data.bmi_category })
    setView('dashboard')
  }

  function handleRegistered(email) {
    setRegisteredEmail(email)
    setView('login')
  }

  function handleLogout() {
    clearToken()
    setSession(null)
    setView('login')
  }

  if (view === 'checking') return null

  if (view === 'login') {
    return (
      <Login
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => { setRegisteredEmail(''); setView('register') }}
        initialEmail={registeredEmail}
        successMessage={registeredEmail ? 'Account created — log in to continue.' : ''}
      />
    )
  }

  if (view === 'register') {
    return <Register onRegistered={handleRegistered} onSwitchToLogin={() => setView('login')} />
  }

  return <Dashboard session={session} onProfileUpdated={(profile, bmi, bmiCategory) => setSession((s) => ({ ...s, profile, bmi, bmiCategory }))} onLogout={handleLogout} />
}
