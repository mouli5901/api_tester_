import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getShareLink } from '../../services/shareService'
import { getRequests } from '../../services/requestService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import RequestEditor from '../../components/RequestEditor/RequestEditor'
import Spinner from '../../components/Spinner/Spinner'
import './SharedView.css'

export default function SharedView() {
  const { token } = useParams()

  const [status, setStatus] = useState('loading') // loading | notfound | ready
  const [collectionName, setCollectionName] = useState('')
  const [requests, setRequests] = useState([])
  const [activeRequest, setActiveRequest] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const linkData = await getShareLink(token)

        if (!linkData || linkData.active === false) {
          if (mounted) setStatus('notfound')
          return
        }

        const collectionId = linkData.collectionId

        // Fetch collection name
        const colSnap = await getDoc(doc(db, 'collections', collectionId))
        if (mounted && colSnap.exists()) {
          setCollectionName(colSnap.data().name || 'Shared Collection')
        }

        // Fetch requests
        const reqs = await getRequests(collectionId)
        if (mounted) {
          setRequests(reqs)
          setStatus('ready')
        }
      } catch {
        if (mounted) setStatus('notfound')
      }
    }

    load()
    return () => { mounted = false }
  }, [token])

  /* ---- 404 ---- */
  if (status === 'notfound') {
    return (
      <div className="shared-404">
        <div className="shared-404-code">404</div>
        <h2>Link not found or expired</h2>
        <p>This shared collection link is no longer active.</p>
        <Link to="/login">Sign up to create your own →</Link>
      </div>
    )
  }

  /* ---- Loading ---- */
  if (status === 'loading') {
    return (
      <div className="shared-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  /* ---- Ready ---- */
  return (
    <div className="shared-view">
      {/* Banner */}
      <div className="shared-banner">
        Viewing shared collection —{' '}
        <Link to="/login">Sign up to create your own</Link>
      </div>

      <div className="shared-body">
        {/* Sidebar */}
        <aside className="shared-sidebar">
          <div className="shared-sidebar-header">
            <div className="shared-collection-name">{collectionName}</div>
            <span className="shared-readonly-badge">Read-only</span>
          </div>

          <div className="shared-request-list">
            {requests.length === 0 ? (
              <div style={{ padding: '24px 16px', color: 'var(--color-text-hint)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                No requests in this collection.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  className={`shared-request-item ${
                    activeRequest?.id === req.id ? 'active' : ''
                  }`}
                  key={req.id}
                  onClick={() => setActiveRequest(req)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setActiveRequest(req)
                  }
                >
                  <span
                    className={`cv-method-badge method-${req.method || 'GET'}`}
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-bold)',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      minWidth: 40,
                      textAlign: 'center',
                    }}
                  >
                    {(req.method || 'GET').substring(0, 3)}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 'var(--text-sm)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {req.name || 'Untitled'}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Area — request editor in read-only (no save) */}
        <main className="shared-main">
          <RequestEditor
            key={activeRequest?.id || 'new'}
            initialRequest={activeRequest}
            hideSave
          />
        </main>
      </div>
    </div>
  )
}
