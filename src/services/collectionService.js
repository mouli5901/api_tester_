import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  addDoc,
} from 'firebase/firestore'
import { db } from './firebase'

function normalizeCollection(docSnapshot) {
  const data = docSnapshot.data()

  return {
    id: docSnapshot.id,
    ...data,
  }
}

export async function getUserCollections(userId) {
  try {
    const collectionsQuery = query(
      collection(db, 'collections'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(collectionsQuery)
    const collections = snapshot.docs.map(normalizeCollection)
    // Sort client-side to avoid requiring a composite index
    collections.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeB - timeA
    })
    return collections
  } catch (err) {
    console.error('Firestore error:', err)
    throw new Error('Unable to load your collections right now.')
  }
}

export async function createCollection(userId, name) {
  try {
    const payload = {
      userId,
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'collections'), payload)
    return {
      id: docRef.id,
      ...payload,
    }
  } catch {
    throw new Error('Unable to create that collection right now.')
  }
}

export async function updateCollection(id, data) {
  try {
    const collectionRef = doc(db, 'collections', id)
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(collectionRef, payload)
    return {
      id,
      ...payload,
    }
  } catch {
    throw new Error('Unable to update that collection right now.')
  }
}

export async function deleteCollection(id) {
  try {
    const requestsCollectionRef = collection(db, 'collections', id, 'requests')
    const requestsSnapshot = await getDocs(requestsCollectionRef)
    const batch = writeBatch(db)

    requestsSnapshot.forEach((requestDoc) => {
      batch.delete(requestDoc.ref)
    })

    await batch.commit()
    await deleteDoc(doc(db, 'collections', id))
  } catch {
    throw new Error('Unable to delete that collection right now.')
  }
}
