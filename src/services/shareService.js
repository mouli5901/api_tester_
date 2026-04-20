import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

export async function createShareLink(collectionId) {
  try {
    const token = crypto.randomUUID()
    await setDoc(doc(db, 'shareLinks', token), {
      collectionId,
      token,
      active: true,
      createdAt: serverTimestamp(),
      expiresAt: null,
    })
    return `${window.location.origin}/share/${token}`
  } catch {
    throw new Error('Unable to create a share link right now.')
  }
}

export async function getShareLink(token) {
  try {
    const snapshot = await getDoc(doc(db, 'shareLinks', token))
    return snapshot.exists() ? snapshot.data() : null
  } catch {
    throw new Error('Unable to load that shared link right now.')
  }
}

export async function deactivateShareLink(token) {
  try {
    await updateDoc(doc(db, 'shareLinks', token), { active: false })
  } catch {
    throw new Error('Unable to disable that shared link right now.')
  }
}
