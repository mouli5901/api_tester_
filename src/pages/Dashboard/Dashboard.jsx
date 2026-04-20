import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCollections } from '../../context/CollectionContext'
import Spinner from '../../components/Spinner/Spinner'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { collections, loading, error, addCollection, removeCollection } =
    useCollections()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  /* ---- computed metrics ---- */
  const totalRequests = useMemo(
    () =>
      collections.reduce(
        (sum, c) => sum + (c.requestCount ?? c.requests?.length ?? 0),
        0
      ),
    [collections]
  )

  /* ---- handlers ---- */
  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch {
      /* AuthContext already handled */
    }
  }, [logout])

  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    setCreating(true)
    try {
      await addCollection(trimmed)
      setNewName('')
      setShowCreate(false)
    } catch {
      /* CollectionContext sets error */
    } finally {
      setCreating(false)
    }
  }, [newName, addCollection])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeCollection(deleteTarget)
    } catch {
      /* handled */
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, removeCollection])

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  /* ---- render helpers ---- */
  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <div className="skeleton-card" key={i}>
        <div className="skeleton-line wide" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line narrow" />
      </div>
    ))

  const renderEmpty = () => (
    <div className="empty-state">
      <div className="empty-illustration">📂</div>
      <h2 className="empty-title">No collections yet</h2>
      <p className="empty-message">
        Collections help you group and organize your API requests. Create your
        first one to get started.
      </p>
      <button
        className="empty-cta-btn"
        onClick={() => setShowCreate(true)}
        type="button"
      >
        ＋ Create your first collection
      </button>
    </div>
  )

  return (
    <div className="dashboard">
      {/* ---- Navbar ---- */}
      <nav className="dashboard-navbar">
        <span className="navbar-brand">🚀 API Testing</span>
        <div className="navbar-right">
          <span className="navbar-email">{user?.email}</span>
          <button
            className="navbar-logout-btn"
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* ---- Main Content ---- */}
      <main className="dashboard-content">
        {/* Metric cards */}
        <div className="metrics-row">
          <div className="metric-card">
            <p className="metric-label">Total Collections</p>
            <p className="metric-value">{loading ? '—' : collections.length}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Total Saved Requests</p>
            <p className="metric-value">{loading ? '—' : totalRequests}</p>
          </div>
        </div>

        {error && <div className="dashboard-error">⚠ {error}</div>}

        {/* Section header + action */}
        <div className="action-row">
          <h2 className="section-title">Collections</h2>
          {!showCreate && (
            <button
              className="new-collection-btn"
              onClick={() => setShowCreate(true)}
              disabled={loading}
              type="button"
            >
              ＋ New Collection
            </button>
          )}
        </div>

        {/* Inline create row */}
        {showCreate && (
          <div className="inline-create-row">
            <input
              type="text"
              placeholder="Collection name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              disabled={creating}
            />
            <button
              className="inline-confirm-btn"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              type="button"
            >
              {creating ? <Spinner size="sm" /> : 'Create'}
            </button>
            <button
              className="inline-cancel-btn"
              onClick={() => {
                setShowCreate(false)
                setNewName('')
              }}
              disabled={creating}
              type="button"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Collections list */}
        {loading ? (
          <div className="collections-grid">{renderSkeletons()}</div>
        ) : collections.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="collections-grid">
            {collections.map((c) => (
              <div
                className="collection-card"
                key={c.id}
                onClick={() => navigate(`/collection/${c.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && navigate(`/collection/${c.id}`)
                }
              >
                <h3 className="collection-card-name">{c.name}</h3>
                <p className="collection-card-requests">
                  {c.requestCount ?? c.requests?.length ?? 0} request
                  {(c.requestCount ?? c.requests?.length ?? 0) !== 1
                    ? 's'
                    : ''}
                </p>
                <div className="collection-card-meta">
                  <span>Updated {formatDate(c.updatedAt)}</span>
                </div>
                <button
                  className="collection-delete-btn"
                  title="Delete collection"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(c.id)
                  }}
                  type="button"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="delete-confirm-overlay"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="delete-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete collection?</h3>
            <p>
              This will permanently remove the collection and all its saved
              requests. This action cannot be undone.
            </p>
            <div className="delete-confirm-actions">
              <button
                className="delete-confirm-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                type="button"
              >
                Cancel
              </button>
              <button
                className="delete-confirm-delete"
                onClick={confirmDelete}
                disabled={deleting}
                type="button"
              >
                {deleting ? <Spinner size="sm" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
