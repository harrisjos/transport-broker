// @ts-nocheck
/**
 * JWT Auth context provider for managing user authentication
 */
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/** @type {AuthContextType} */
const defaultAuthContext = {
    user: null,
    loading: false,
    signIn: async (email, password) => {
        throw new Error('AuthProvider not initialized')
    },
    signUp: async (userData) => {
        throw new Error('AuthProvider not initialized')
    },
    logout: async () => { },
    getCurrentUser: async () => null,
    makeAuthenticatedRequest: async (url, options = {}) => {
        // Fallback simple fetch for cases where provider is not mounted
        return fetch(url, options)
    }
}

const AuthContext = createContext(defaultAuthContext)

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {string} phone
 * @property {'customer' | 'carrier' | 'admin'} role
 * @property {boolean} is_email_verified
 * @property {Array<Object>} organizations
 * @property {string} [organizationType] - Organization type for convenience (derived from primary organization)
 */

/**
 * @typedef {Object} SignUpData
 * @property {string} email
 * @property {string} password
 * @property {string} [name]
 * @property {string} [phone]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user
 * @property {boolean} loading
 * @property {function(string, string): Promise<object>} signIn
 * @property {function(SignUpData): Promise<object>} signUp
 * @property {function(): Promise<void>} logout
 * @property {function(): Promise<User|null>} getCurrentUser
 * @property {function(string, object=): Promise<Response>} makeAuthenticatedRequest
 */

/**
 * Auth provider component
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export function AuthProvider({ children }) {
    /** @type {[User | null, import('react').Dispatch<import('react').SetStateAction<User | null>>]} */
    const [user, setUser] = useState(/** @type {User | null} */(null))
    const [loading, setLoading] = useState(true)

    // API base URL
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    // Helper function to make authenticated API calls
    /**
     * @typedef {Object.<string, string>} HeadersRecord
     */

    /**
     * Make an authenticated fetch call, adding the stored Bearer token if present.
     * @param {string} url
     * @param {RequestInit & { headers?: HeadersRecord }} [options]
     * @returns {Promise<Response>}
     */
    const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
        /** @type {string | null} */
        const token = localStorage.getItem('authToken')

        // Normalize headers using the Headers constructor to accept various HeadersInit types
        const headers = new Headers(options.headers)
        // ensure JSON content type is set if not provided
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        return fetch(url, {
            ...options,
            headers
        })
    }, [])

    // Load user profile from token
    const getCurrentUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) {
                setUser(null)
                setLoading(false)
                return null
            }

            const response = await makeAuthenticatedRequest('/api/auth/me')

            if (!response.ok) {
                // Token is invalid, remove it
                localStorage.removeItem('authToken')
                setUser(null)
                setLoading(false)
                return null
            }

            const userData = await response.json()
            setUser(userData)
            setLoading(false)
            return userData
        } catch (error) {
            console.error('Error getting current user:', error)
            localStorage.removeItem('authToken')
            setUser(null)
            setLoading(false)
            return null
        }
    }, [makeAuthenticatedRequest, setUser, setLoading])

    // Sign in function
    /**
     * @typedef {Object} AuthResponse
     * @property {string} token
     * @property {User} user
     * @property {string} [error]
     */

    /**
     * Sign in user with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<AuthResponse>}
     */
    const signIn = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            /** @type {AuthResponse} */
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Store token
            localStorage.setItem('authToken', data.token)

            // Get full user profile with organization data
            await getCurrentUser()

            return data
        } catch (error) {
            console.error('Sign in error:', error)
            throw error
        }
    }

    // Sign up function
    /**
     * @typedef {Object} SignUpData
     * @property {string} email
     * @property {string} password
     * @property {string} [name]
     * @property {string} [phone]
     */

    /**
     * @typedef {Object} SignUpResponse
     * @property {string} token
     * @property {User} user
     * @property {string} [error]
     */

    /**
     * Sign up a new user
     * @param {SignUpData} userData
     * @returns {Promise<SignUpResponse>}
     */
    const signUp = async (userData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            /** @type {SignUpResponse} */
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Store token
            localStorage.setItem('authToken', data.token)

            // Set user data
            setUser(data.user)

            return data
        } catch (error) {
            console.error('Sign up error:', error)
            throw error
        }
    }

    // Logout function
    const logout = async () => {
        try {
            // Remove token
            localStorage.removeItem('authToken')

            // Clear user state
            setUser(null)

            // Optional: call logout endpoint for server-side cleanup
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
            })
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Load user on mount
    useEffect(() => {
        getCurrentUser()
    }, [getCurrentUser])

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        getCurrentUser,
        makeAuthenticatedRequest
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
