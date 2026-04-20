// ============================================================
// Authentication Service — Firebase v9 Modular SDK
// ============================================================
// Every function is wrapped in try/catch and throws a clean,
// user-friendly error message instead of raw Firebase codes.
// ============================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

/**
 * Translates Firebase auth error codes into user-friendly messages.
 * @param {string} code — Firebase error code (e.g. "auth/user-not-found")
 * @returns {string} Human-readable error message
 */
function getAuthErrorMessage(code) {
  const errorMap = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled.',
  }

  return errorMap[code] || 'An unexpected error occurred. Please try again.'
}

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').User>} The authenticated user object
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Create a new user account with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').User>} The newly created user object
 */
export async function signupUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Sign out the currently authenticated user.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.')
  }
}

/**
 * Subscribe to authentication state changes.
 * Fires immediately with the current user (or null) and then
 * again whenever the user signs in or out.
 *
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback)
}
