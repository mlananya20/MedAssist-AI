import { Activity, MessageSquare, History, BarChart3, MapPin, User, LogOut } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Dashboard', icon: Activity },
  { id: 'chat', label: 'Symptom Checker', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'hospitals', label: 'Hospitals', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Sidebar({ userId, tab, setTab, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Activity size={16} color="#0D9488" />
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
              <Icon size={17} />
              {t.label}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-email">{userId}</p>
        <button className="logout-btn-small" onClick={onLogout}>
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  )
}
