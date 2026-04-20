import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, variant = 'info', visible, onClose }) {
  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.()
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [visible, onClose])

  if (!visible || !message) {
    return null
  }

  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  )
}
