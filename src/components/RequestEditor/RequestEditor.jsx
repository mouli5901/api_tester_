import { useState, useCallback, useEffect, useMemo } from 'react'
import useRequest from '../../hooks/useRequest'
import useHistory from '../../hooks/useHistory'
import ResponsePane from './ResponsePane'
import Spinner from '../Spinner/Spinner'
import './RequestEditor.css'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const emptyRequest = {
  name: '',
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '' }],
  body: '',
  authType: 'none',
  authValue: '',
}

export default function RequestEditor({
  initialRequest = null,
  onSave,
  collectionId,
  hideSave = false,
}) {
  /* ---- local form state ---- */
  const [name, setName] = useState('')
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [authType, setAuthType] = useState('none')
  const [authValue, setAuthValue] = useState('')
  const [activeTab, setActiveTab] = useState('headers')
  const [saving, setSaving] = useState(false)

  const { execute, response, loading, error } = useRequest()
  const { addToHistory } = useHistory()

  /* ---- sync from initialRequest ---- */
  useEffect(() => {
    if (initialRequest) {
      setName(initialRequest.name || '')
      setMethod(initialRequest.method || 'GET')
      setUrl(initialRequest.url || '')
      setBody(initialRequest.body || '')
      setAuthType(initialRequest.authType || 'none')
      setAuthValue(initialRequest.authValue || '')

      // Convert headers object → array of {key,value}
      if (
        initialRequest.headers &&
        typeof initialRequest.headers === 'object' &&
        !Array.isArray(initialRequest.headers)
      ) {
        const arr = Object.entries(initialRequest.headers).map(([k, v]) => ({
          key: k,
          value: v,
        }))
        setHeaders(arr.length ? arr : [{ key: '', value: '' }])
      } else if (Array.isArray(initialRequest.headers)) {
        setHeaders(
          initialRequest.headers.length
            ? initialRequest.headers
            : [{ key: '', value: '' }]
        )
      } else {
        setHeaders([{ key: '', value: '' }])
      }
    } else {
      // reset to blank
      setName(emptyRequest.name)
      setMethod(emptyRequest.method)
      setUrl(emptyRequest.url)
      setHeaders([{ key: '', value: '' }])
      setBody(emptyRequest.body)
      setAuthType(emptyRequest.authType)
      setAuthValue(emptyRequest.authValue)
    }
  }, [initialRequest])

  /* ---- headers helpers ---- */
  const updateHeader = (index, field, value) => {
    setHeaders((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    )
  }

  const removeHeader = (index) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index))
  }

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '' }])
  }

  /* ---- build config ---- */
  const buildHeadersObject = () => {
    const obj = {}
    headers.forEach(({ key, value }) => {
      if (key.trim()) obj[key.trim()] = value
    })
    return obj
  }

  /* ---- send ---- */
  const handleSend = useCallback(async () => {
    if (!url.trim()) return
    try {
      const result = await execute({
        url: url.trim(),
        method,
        headers: buildHeadersObject(),
        body,
        authType,
        authValue,
      })

      if (result) {
        addToHistory({
          id: crypto.randomUUID(),
          url: url.trim(),
          method,
          status: result.status,
          latency: result.latency,
          timestamp: Date.now(),
        })
      }
    } catch {
      /* error is already set in useRequest state */
    }
  }, [url, method, headers, body, authType, authValue, execute, addToHistory])

  /* ---- save ---- */
  const handleSave = useCallback(async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave({
        id: initialRequest?.id || null,
        name: name || 'Untitled request',
        method,
        url,
        headers: buildHeadersObject(),
        body,
        authType,
        authValue,
      })
    } catch {
      /* handled by parent */
    } finally {
      setSaving(false)
    }
  }, [name, method, url, headers, body, authType, authValue, onSave, initialRequest])

  /* ---- formatted body for display ---- */
  const formattedBody = useMemo(() => {
    if (!response?.body) return ''
    if (typeof response.body === 'object') {
      return JSON.stringify(response.body, null, 2)
    }
    return String(response.body)
  }, [response])

  return (
    <div className="request-editor-layout">
      {/* ---- Editor Column ---- */}
      <div className="editor-panel">
        {/* Request name */}
        <input
          className="request-name-input"
          type="text"
          placeholder="Request name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* URL bar */}
        <div className="url-bar">
          <select
            className={`method-select method-${method}`}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            className="url-input"
            type="text"
            placeholder="https://api.example.com/endpoint"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>

        {/* Action buttons */}
        <div className="editor-actions">
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !url.trim()}
            type="button"
          >
            {loading ? <Spinner size="sm" /> : 'Send'}
          </button>
          {!hideSave && onSave && (
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? <Spinner size="sm" /> : 'Save'}
            </button>
          )}
        </div>

        {error && <div className="editor-error">⚠ {error}</div>}

        {/* Tabs */}
        <div className="editor-tabs">
          {['headers', 'body', 'auth'].map((tab) => (
            <button
              key={tab}
              className={`editor-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="tab-panel">
          {activeTab === 'headers' && (
            <>
              {headers.map((h, i) => (
                <div className="header-row" key={i}>
                  <input
                    type="text"
                    placeholder="Header name"
                    value={h.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  />
                  <button
                    className="header-remove-btn"
                    onClick={() => removeHeader(i)}
                    type="button"
                    title="Remove header"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="add-header-btn"
                onClick={addHeader}
                type="button"
              >
                ＋ Add header
              </button>
            </>
          )}

          {activeTab === 'body' && (
            <textarea
              className="body-textarea"
              placeholder='{ "key": "value" }'
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          )}

          {activeTab === 'auth' && (
            <div className="auth-section">
              <select
                className="auth-select"
                value={authType}
                onChange={(e) => {
                  setAuthType(e.target.value)
                  setAuthValue('')
                }}
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>

              {authType === 'bearer' && (
                <div className="auth-input-group">
                  <label>Token</label>
                  <input
                    type="text"
                    placeholder="Paste your bearer token"
                    value={authValue}
                    onChange={(e) => setAuthValue(e.target.value)}
                  />
                </div>
              )}

              {authType === 'basic' && (
                <div className="auth-input-group">
                  <label>Username:Password</label>
                  <input
                    type="text"
                    placeholder="username:password"
                    value={authValue}
                    onChange={(e) => setAuthValue(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Response Column ---- */}
      <ResponsePane response={response} formattedBody={formattedBody} />
    </div>
  )
}
