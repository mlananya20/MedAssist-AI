import { useState } from 'react'

export default function Composer({ symptoms, onAdd, onRemove, onSend, loading }) {
  const [value, setValue] = useState('')

  function handleAdd() {
    const cleaned = value.trim()
    if (!cleaned) return
    onAdd(cleaned)
    setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="composer">
      {symptoms.length > 0 && (
        <div className="chip-row">
          {symptoms.map((s) => (
            <span className="chip" key={s}>
              {s}
              <button onClick={() => onRemove(s)} aria-label={`Remove ${s}`}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="composer-row">
        <input
          type="text"
          placeholder="Type a symptom, e.g. high fever"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-btn" onClick={handleAdd} disabled={!value.trim()}>Add</button>
        <button className="send-btn" onClick={onSend} disabled={symptoms.length === 0 || loading}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
