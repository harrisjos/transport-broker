// @ts-check
/**
 * Firebase Auth context provider for managing user authentication
 */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'

// Firebase configuration (will be set via environment variables)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

const AuthContext = createContext({})

/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {string} role - 'customer' | 'carrier' | 'admin'
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user
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
 * @returns {AuthContextType}
 */
export function useAuth() {
    return useContext(AuthContext)
}