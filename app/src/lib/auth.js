/**
 * JWT Auth context provider for managing user authentication
 */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth'

// Initialize Firebase app (guard against multiple initializations during hot reload)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

const AuthContext = createContext({})

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {string} phone
 * @property {boolean} is_email_verified
 * @property {Array<Object>} organizations
 */

/**
 * @typedef {Object} FirebaseUser
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {string} role
 */

/**
 * @typedef {Object} AuthContextType
 * @property {FirebaseUser | null} user
 * @property {boolean} loading
 * @property {function(string, string): Promise<any>} signIn
 * @property {function(string, string): Promise<any>} signUp
 * @property {function(): Promise<any>} signInWithGoogle
 * @property {function(): Promise<void>} logout
 */

/**
 * Auth provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get user role from backend API
                try {
                    const token = await firebaseUser.getIdToken()
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    const userData = await response.json()

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: userData.role || 'customer'
                    })
                } catch (error) {
                    console.error('Error fetching user profile:', error)
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: 'customer'
                    })
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    /**
     * Sign in with email and password
     * @param {string} email 
     * @param {string} password 
     */
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    /**
     * Sign up with email and password
     * @param {string} email 
     * @param {string} password 
     */
    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    /**
     * Sign in with Google
     */
    const signInWithGoogle = () => {
        return signInWithPopup(auth, googleProvider)
    }

    /**
     * Sign out
     */
    const logout = () => {
        return signOut(auth)
    }

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook to use auth context
 */
export function useAuth() {
    return useContext(AuthContext)
}
