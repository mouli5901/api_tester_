import { useState, useCallback } from 'react'

/**
 * ResponsePane — renders the API response with status badge,
 * latency, size, syntax-highlighted JSON body, and collapsible
 * response headers.
 */
export default function ResponsePane({ response, formattedBody }) {
  const [headersOpen, setHeadersOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return 'status-2xx'
    if (status >= 300 && status < 400) return 'status-3xx'
    return status >= 400 ? 'status-4xx' : ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  const handleCopy = useCallback(async () => {
    if (!formattedBody) return
    try {
      await navigator.clipboard.writeText(formattedBody)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available */
    }
  }, [formattedBody])

  /**
   * Simple JSON syntax highlighter using CSS class spans.
   * Wraps keys, strings, numbers, booleans and null tokens.
   */
  const highlightJSON = (text) => {
    if (!text) return ''
    try {
      // Test if it's valid JSON first
      JSON.parse(text)
    } catch {
      return text // return raw if not JSON
    }

    return text.replace(
      /("(\\.|[^"\\])*")\s*:/g,
      '<span class="json-key">$1</span>:'
    )
    .replace(
      /:\s*("(\\.|[^"\\])*")/g,
      ': <span class="json-string">$1</span>'
    )
    .replace(
      /:\s*(-?\d+\.?\d*([eE][+-]?\d+)?)/g,
      ': <span class="json-number">$1</span>'
    )
    .replace(
      /:\s*(true|false)/g,
      ': <span class="json-boolean">$1</span>'
    )
    .replace(
      /:\s*(null)/g,
      ': <span class="json-null">$1</span>'
    )
  }

  if (!response) {
    return (
      <div className="response-pane">
        <div className="response-empty">
          <span className="response-empty-icon">⚡</span>
          <p>Hit <strong>Send</strong> to see the response here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="response-pane">
      {/* Status bar */}
      <div className="response-status-bar">
        <span className={`status-badge ${getStatusClass(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="response-meta">{response.latency} ms</span>
        <span className="response-meta">{formatSize(response.size)}</span>
        <button className="copy-btn" onClick={handleCopy} type="button">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Body */}
      <div className="response-body-block">
        <pre
          dangerouslySetInnerHTML={{
            __html: highlightJSON(formattedBody),
          }}
        />
      </div>

      {/* Response headers (collapsible) */}
      {response.headers && (
        <>
          <button
            className="response-headers-toggle"
            onClick={() => setHeadersOpen((o) => !o)}
            type="button"
          >
            <span className={`chevron ${headersOpen ? 'open' : ''}`}>▶</span>
            Response Headers ({Object.keys(response.headers).length})
          </button>
          {headersOpen && (
            <div className="response-headers-list">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k}>
                  <strong>{k}</strong>: <span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
