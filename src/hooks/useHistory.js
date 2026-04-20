import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'apg_history'

function loadInitialHistory() {
  try {
    const storedHistory = window.localStorage.getItem(STORAGE_KEY)
    return storedHistory ? JSON.parse(storedHistory) : []
  } catch {
    return []
  }
}

export default function useHistory() {
  const [history, setHistory] = useState(() => loadInitialHistory())
  const historyRef = useRef(history)

  useEffect(() => {
    historyRef.current = history
  }, [history])

  const addToHistory = (entry) => {
    const nextHistory = [entry, ...historyRef.current].slice(0, 20)
    historyRef.current = nextHistory
    setHistory(nextHistory)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
  }

  const clearHistory = () => {
    historyRef.current = []
    setHistory([])
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addToHistory, clearHistory }
}
