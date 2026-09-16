import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { fetchAnalytics } from '../api'

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics().then(setData).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error-note" style={{ padding: 28 }}>{error}</p>
  if (!data) return <p className="welcome" style={{ padding: 28 }}>Loading analytics…</p>

  if (data.total_predictions === 0) {
    return <p className="welcome" style={{ padding: 28 }}>No predictions yet — run some from the Chat tab to see analytics here.</p>
  }

  const { total_predictions, disease_distribution, most_common_symptoms, weekly_trend, average_confidence, model_accuracy } = data

  return (
    <div className="analytics-panel">
      <div className="stat-grid">
        <StatCard label="Total predictions" value={total_predictions} />
        <StatCard label="Average confidence" value={`${average_confidence}%`} />
        <StatCard
          label="Model accuracy"
          value={model_accuracy.random_forest ? `${(model_accuracy.random_forest * 100).toFixed(1)}%` : '—'}
          sub="Random Forest (test set)"
        />
        <StatCard
          label="Decision Tree accuracy"
          value={model_accuracy.decision_tree ? `${(model_accuracy.decision_tree * 100).toFixed(1)}%` : '—'}
          sub="test set"
        />
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <p className="section-label">Weekly prediction trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly_trend}>
              <CartesianGrid stroke="#DCEAE7" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#5C7A74" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#5C7A74" fontSize={11} tickLine={false} axisLine={false} width={24} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #DCEAE7', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <p className="section-label">Disease distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={disease_distribution} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} stroke="#5C7A74" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="disease" width={110} stroke="#5C7A74" fontSize={10.5} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #DCEAE7', fontSize: 12 }} />
              <Bar dataKey="count" fill="#0D9488" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: 16 }}>
        <p className="section-label">Most common symptoms</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={most_common_symptoms}>
            <XAxis dataKey="symptom" stroke="#5C7A74" fontSize={10.5} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} stroke="#5C7A74" fontSize={11} tickLine={false} axisLine={false} width={24} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #DCEAE7', fontSize: 12 }} />
            <Bar dataKey="count" fill="#0D9488" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
