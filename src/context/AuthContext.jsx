// ============================================================
// AuthContext — Global Authentication State
// ============================================================
// Provides user, loading, login, signup, and logout to the
// entire component tree. Stays in sync with Firebase Auth
// via onAuthStateChanged listener.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  loginUser,
  signupUser,
  logoutUser,
  onAuthStateChange,
} from '../services/authService'

// Create the context with undefined default so we can detect
// when useAuth is called outside of the provider.
const AuthContext = createContext(undefined)

/**
 * AuthProvider — wraps the app and provides auth state + actions.
 *
 * State:
 *   user    — null (signed out) or Firebase User object
 *   loading — true while the initial auth check is in progress
 *
 * Actions:
 *   login(email, password)  — signs in, rethrows on failure
 *   signup(email, password) — creates account, rethrows on failure
 *   logout()                — signs out, rethrows on failure
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to Firebase auth state on mount.
  // The listener fires immediately with the current user (or null)
  // and again whenever auth state changes (login / logout).
  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  /**
   * Sign in with email and password.
   * Does NOT set user manually — the onAuthStateChanged listener
   * handles that automatically when Firebase confirms the sign-in.
   * Rethrows errors so the calling component can display them.
   */
  const login = useCallback(async (email, password) => {
    try {
      await loginUser(email, password)
    } catch (error) {
      throw error
    }
  }, [])

  /**
   * Create a new account with email and password.
   * The onAuthStateChanged listener auto-updates user state.
   * Rethrows errors for the calling component to handle.
   */
  const signup = useCallback(async (email, password) => {
    try {
      await signupUser(email, password)
    } catch (error) {
      throw error
    }
  }, [])

  /**
   * Sign out the current user.
   * The onAuthStateChanged listener auto-sets user to null.
   * Rethrows errors for the calling component to handle.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (error) {
      throw error
    }
  }, [])

  // The value object provided to all consumers.
  // user and loading change over time; login/signup/logout are
  // stable references thanks to useCallback.
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth — custom hook to consume AuthContext.
 *
 * Throws a descriptive error if called outside of <AuthProvider>,
 * making it easy to catch wiring mistakes during development.
 *
 * @returns {{ user: object|null, loading: boolean, login: Function, signup: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Wrap your component tree with <AuthProvider> in App.jsx.'
    )
  }

  return context
}

export default AuthProvider
