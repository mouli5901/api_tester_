import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

function normalizeRequest(docSnapshot) {
  return {
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }
}

export async function getRequests(collectionId) {
  try {
    const requestsQuery = query(
      collection(db, 'collections', collectionId, 'requests')
    )
    const snapshot = await getDocs(requestsQuery)
    const requests = snapshot.docs.map(normalizeRequest)
    requests.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    return requests
  } catch (err) {
    console.error('Firestore error:', err)
    throw new Error('Unable to load saved requests right now.')
  }
}

export async function saveRequest(collectionId, requestData) {
  try {
    const payload = {
      name: requestData.name,
      method: requestData.method,
      url: requestData.url,
      headers: requestData.headers || {},
      body: requestData.body || '',
      authType: requestData.authType || 'none',
      authValue: requestData.authValue || '',
      sortOrder: requestData.sortOrder ?? Date.now(),
      savedAt: serverTimestamp(),
    }
    const docRef = await addDoc(
      collection(db, 'collections', collectionId, 'requests'),
      payload
    )
    return {
      id: docRef.id,
      ...payload,
    }
  } catch {
    throw new Error('Unable to save this request right now.')
  }
}

export async function updateRequest(collectionId, requestId, data) {
  try {
    await updateDoc(doc(db, 'collections', collectionId, 'requests', requestId), data)
    return {
      id: requestId,
      ...data,
    }
  } catch {
    throw new Error('Unable to update this request right now.')
  }
}

export async function deleteRequest(collectionId, requestId) {
  try {
    await deleteDoc(doc(db, 'collections', collectionId, 'requests', requestId))
  } catch {
    throw new Error('Unable to delete this request right now.')
  }
}
