import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCollections } from '../../context/CollectionContext'
import {
  getRequests,
  saveRequest,
  updateRequest,
  deleteRequest,
} from '../../services/requestService'
import { createShareLink } from '../../services/shareService'
import RequestEditor from '../../components/RequestEditor/RequestEditor'
import Toast from '../../components/Toast/Toast'
import Spinner from '../../components/Spinner/Spinner'
import './CollectionView.css'

export default function CollectionView() {
  const { id: collectionId } = useParams()
  const navigate = useNavigate()
  const { collections, renameCollection } = useCollections()

  /* ---- local state ---- */
  const [requests, setRequests] = useState([])
  const [loadingReqs, setLoadingReqs] = useState(true)
  const [reqError, setReqError] = useState('')
  const [activeRequest, setActiveRequest] = useState(null)

  /* editable collection name */
  const collection = collections.find((c) => c.id === collectionId)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  /* share modal */
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharing, setSharing] = useState(false)

  /* toast */
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' })

  /* ---- fetch requests on mount ---- */
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoadingReqs(true)
      setReqError('')
      try {
        const data = await getRequests(collectionId)
        if (mounted) setRequests(data)
      } catch (err) {
        if (mounted) setReqError(err.message)
      } finally {
        if (mounted) setLoadingReqs(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [collectionId])

  /* sync name value */
  useEffect(() => {
    if (collection) setNameValue(collection.name)
  }, [collection])

  /* ---- handlers ---- */
  const handleSaveName = useCallback(async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === collection?.name) {
      setEditingName(false)
      return
    }
    try {
      await renameCollection(collectionId, { name: trimmed })
    } catch {
      /* context handles error */
    }
    setEditingName(false)
  }, [nameValue, collection, collectionId, renameCollection])

  const handleNewRequest = () => {
    setActiveRequest(null)
  }
// new request is just empty editor, activeRequest null means new request. 
// when user clicks on existing request, activeRequest is set to that request, editor shows that request data. 
// when user saves, if activeRequest has id, we update, else we create new. after delete, 
// if deleted request was active, we set activeRequest to null so editor goes back to new request state.
  const handleSelectRequest = (req) => {
    setActiveRequest(req)
  }

  const handleDeleteRequest = useCallback(
    async (e, reqId) => {
      e.stopPropagation()
      try {
        await deleteRequest(collectionId, reqId)
        setRequests((prev) => prev.filter((r) => r.id !== reqId))
        if (activeRequest?.id === reqId) setActiveRequest(null)
      } catch (err) {
        setReqError(err.message)
      }
    },
    [collectionId, activeRequest]
  )

  const handleSaveRequest = useCallback(
    async (requestData) => {
      try {
        if (requestData.id) {
          // update existing
          const updated = await updateRequest(collectionId, requestData.id, {
            name: requestData.name,
            method: requestData.method,
            url: requestData.url,
            headers: requestData.headers,
            body: requestData.body,
            authType: requestData.authType,
            authValue: requestData.authValue,
          })
          setRequests((prev) =>
            prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
          )
          setActiveRequest((prev) => (prev ? { ...prev, ...updated } : prev))
        } else {
          // create new
          const created = await saveRequest(collectionId, {
            ...requestData,
            sortOrder: Date.now(),
          })
          setRequests((prev) => [...prev, created])
          setActiveRequest(created)
        }
        setToast({ visible: true, message: 'Request saved!', variant: 'success' })
      } catch (err) {
        setToast({ visible: true, message: err.message, variant: 'error' })
      }
    },
    [collectionId]
  )

  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      const url = await createShareLink(collectionId)
      setShareUrl(url)
      setShowShareModal(true)
    } catch (err) {
      setToast({ visible: true, message: err.message, variant: 'error' })
    } finally {
      setSharing(false)
    }
  }, [collectionId])

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setToast({ visible: true, message: 'Link copied!', variant: 'success' })
    } catch {
      /* fallback */
    }
  }

  return (
    <div className="collection-view">
      {/* ---- Sidebar ---- */}
      <aside className="cv-sidebar">
        <div className="cv-sidebar-header">
          <button
            className="cv-back-btn"
            onClick={() => navigate('/')}
            type="button"
          >
            ← Dashboard
          </button>

          {/* Editable collection name */}
          {editingName ? (
            <input
              className="cv-collection-name-input"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
          ) : (
            <span
              className="cv-collection-name"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {collection?.name || 'Collection'}
            </span>
          )}

          <button
            className="cv-new-request-btn"
            onClick={handleNewRequest}
            type="button"
          >
            ＋ New Request
          </button>

          <button
            className="cv-share-btn"
            onClick={handleShare}
            disabled={sharing}
            type="button"
          >
            {sharing ? <Spinner size="sm" /> : '🔗 Share'}
          </button>
        </div>

        {/* Request list */}
        <div className="cv-request-list">
          {loadingReqs ? (
            <div className="cv-sidebar-skeleton">
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="cv-skeleton-item" key={i} />
              ))}
            </div>
          ) : reqError ? (
            <div className="cv-error">{reqError}</div>
          ) : requests.length === 0 ? (
            <div className="cv-empty-requests">
              No requests yet.<br />
              Click "New Request" to start.
            </div>
          ) : (
            requests.map((req) => (
              <div
                className={`cv-request-item ${
                  activeRequest?.id === req.id ? 'active' : ''
                }`}
                key={req.id}
                onClick={() => handleSelectRequest(req)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSelectRequest(req)
                }
              >
                <span
                  className={`cv-method-badge method-${req.method || 'GET'}`}
                >
                  {(req.method || 'GET').substring(0, 3)}
                </span>
                <span className="cv-request-name">
                  {req.name || 'Untitled'}
                </span>
                <button
                  className="cv-request-delete"
                  onClick={(e) => handleDeleteRequest(e, req.id)}
                  title="Delete request"
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ---- Main Editor Area ---- */}
      <main className="cv-main">
        <RequestEditor
          key={activeRequest?.id || 'new'}
          initialRequest={activeRequest}
          onSave={handleSaveRequest}
          collectionId={collectionId}
        />
      </main>

      {/* ---- Share Modal ---- */}
      {showShareModal && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowShareModal(false)}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔗 Share Collection</h3>
            <div className="share-url-row">
              <input value={shareUrl} readOnly />
              <button
                className="share-copy-btn"
                onClick={handleCopyShareUrl}
                type="button"
              >
                Copy
              </button>
            </div>
            <button
              className="share-close-btn"
              onClick={() => setShowShareModal(false)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---- Toast ---- */}
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  )
}
