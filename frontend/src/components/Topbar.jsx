import { Activity, MessageSquare, History, BarChart3, MapPin, User, LogOut } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Dashboard', icon: Activity },
  { id: 'chat', label: 'Symptom Checker', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'hospitals', label: 'Hospitals', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Topbar({ userId, tab, setTab, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark">
            <Activity size={16} color="#5FC0A4" />
          </span>
          <span className="wordmark">MedAssist AI</span>
        </div>

        <nav className="nav-list">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                className={tab === t.id ? 'navtab active' : 'navtab'}
                onClick={() => setTab(t.id)}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="topbar-account">
          <span className="sidebar-email">{userId}</span>
          <button className="logout-btn-small" onClick={onLogout}>
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  )
}