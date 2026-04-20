import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { useAuth } from './AuthContext'
import {
  createCollection,
  deleteCollection,
  getUserCollections,
  updateCollection,
} from '../services/collectionService'

const CollectionContext = createContext(undefined)

const initialState = {
  collections: [],
  loading: false,
  error: null,
}

function collectionReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'SET_COLLECTIONS':
      return {
        ...state,
        collections: action.payload,
        loading: false,
        error: null,
      }
    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [action.payload, ...state.collections],
        error: null,
      }
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((collection) =>
          collection.id === action.payload.id
            ? { ...collection, ...action.payload }
            : collection
        ),
        error: null,
      }
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(
          (collection) => collection.id !== action.payload
        ),
        error: null,
      }
    default:
      return state
  }
}

function CollectionProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(collectionReducer, initialState)

  useEffect(() => {
    let isMounted = true

    async function loadCollections() {
      if (!user) {
        dispatch({ type: 'SET_COLLECTIONS', payload: [] })
        return
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      try {
        const data = await getUserCollections(user.uid)
        if (isMounted) {
          dispatch({ type: 'SET_COLLECTIONS', payload: data })
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [user])

  const addCollection = async (name) => {
    if (!user) {
      throw new Error('You need to sign in before creating a collection.')
    }

    const createdCollection = await createCollection(user.uid, name)
    dispatch({ type: 'ADD_COLLECTION', payload: createdCollection })
    return createdCollection
  }

  const renameCollection = async (id, data) => {
    const updatedCollection = await updateCollection(id, data)
    dispatch({ type: 'UPDATE_COLLECTION', payload: updatedCollection })
    return updatedCollection
  }

  const removeCollection = async (id) => {
    await deleteCollection(id)
    dispatch({ type: 'DELETE_COLLECTION', payload: id })
  }

  const value = useMemo(
    () => ({
      collections: state.collections,
      loading: state.loading,
      error: state.error,
      dispatch,
      addCollection,
      renameCollection,
      removeCollection,
    }),
    [state]
  )

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollections() {
  const context = useContext(CollectionContext)

  if (context === undefined) {
    throw new Error('useCollections must be used within CollectionProvider.')
  }

  return context
}

export default CollectionProvider
