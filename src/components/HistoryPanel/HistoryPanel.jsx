import { useState } from 'react'
import useHistory from '../../hooks/useHistory'
import './HistoryPanel.css'

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function statusClass(status) {
  if (status >= 200 && status < 300) return 's-2xx'
  if (status >= 300 && status < 400) return 's-3xx'
  return 's-4xx'
}

export default function HistoryPanel({ onSelect }) {
  const { history, clearHistory } = useHistory()
  const [open, setOpen] = useState(false)

  const handleSelect = (entry) => {
    onSelect?.(entry)
    setOpen(false)
  }

  return (
    <>
      {/* Toggle button */}
      <button
        className="history-panel-toggle"
        onClick={() => setOpen(true)}
        type="button"
      >
        History
      </button>

      {/* Backdrop */}
      {open && (
        <div className="history-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      <div className={`history-panel ${open ? 'open' : ''}`}>
        <div className="history-panel-header">
          <h3>History</h3>
          <div>
            {history.length > 0 && (
              <button
                className="history-clear-btn"
                onClick={clearHistory}
                type="button"
              >
                Clear All
              </button>
            )}
            <button
              className="history-close-btn"
              onClick={() => setOpen(false)}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <span style={{ fontSize: 28, opacity: 0.4 }}>🕑</span>
              <p>No history yet.<br />Send a request to see it here.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                className="history-entry"
                key={entry.id}
                onClick={() => handleSelect(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(entry)}
              >
                <span className={`history-method m-${entry.method || 'GET'}`}>
                  {(entry.method || 'GET').substring(0, 3)}
                </span>
                <div className="history-info">
                  <div className="history-url">{entry.url}</div>
                  <div className="history-meta">
                    <span
                      className={`history-status-badge ${statusClass(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                    <span>{entry.latency}ms</span>
                    <span>{timeAgo(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
