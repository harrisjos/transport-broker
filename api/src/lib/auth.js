// @ts-nocheck
/**
 * Authentication middleware and utilities for JWT token validation
 */

import { createRequire } from 'module'
import jwt from 'jsonwebtoken'

// JWT Secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

/** @type {any} */
const require = createRequire(import.meta.url)

/** @type {any} */
let admin = null
try {
    // Try to load firebase-admin if available; if not, continue without it.
    admin = require('firebase-admin')
} catch (e) {
    admin = null
}

// Initialize Firebase Admin SDK only if credentials are provided
let firebaseInitialized = false

function initializeFirebase() {
    if (!admin) {
        console.warn('firebase-admin module not available. Using JWT authentication only.')
        return
    }

    if (firebaseInitialized || (admin.apps && admin.apps.length > 0)) {
        return
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase credentials not provided. Using JWT authentication only.')
        return
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        })
        firebaseInitialized = true
        console.log('Firebase Admin SDK initialized successfully')
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error)
    }
}

/**
 * Fastify middleware for JWT authentication
 * @param {any} request
 * @param {any} reply
 */
export async function authenticateToken(request, reply) {
    try {
        const authHeader = request.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return reply.status(401).send({ error: 'Access token required' })
        }

        // Try JWT token first (our new auth system)
        try {
            const decoded = jwt.verify(token, JWT_SECRET)
            // Type assertion for JWT payload
            /** @type {any} */
            const payload = decoded
            request.user = {
                userId: payload.userId,
                uid: payload.userId.toString(), // For compatibility
                email: payload.email,
                organizationId: payload.organizationId,
                role: payload.role,
                emailVerified: true
            }
            return
        } catch (jwtError) {
            /** @type {any} */
            const error = jwtError
            request.log.debug('JWT verification failed, trying Firebase token:', error.message)
        }

        // Fall back to Firebase token verification if JWT fails
        initializeFirebase()

        if (firebaseInitialized) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(token)
                request.user = {
                    uid: decodedToken.uid,
                    userId: decodedToken.uid, // For compatibility
                    email: decodedToken.email,
                    emailVerified: decodedToken.email_verified
                }
                return
            } catch (firebaseError) {
                /** @type {any} */
                const error = firebaseError
                request.log.debug('Firebase token verification failed:', error.message)
            }
        }

        // If both JWT and Firebase fail, return error
        return reply.status(403).send({ error: 'Invalid or expired token' })

    } catch (error) {
        request.log.error('Token verification failed:', error)
        return reply.status(403).send({ error: 'Invalid or expired token' })
    }
}

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Fastify middleware function
 */
export function requireRole(allowedRoles) {
    /**
     * @param {any} request
     * @param {any} reply
     */
    return async function (request, reply) {
        await authenticateToken(request, reply)

        // Get user role from database
        const user = await request.server.db
            .selectFrom('users')
            .select(['role'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        if (!user || !allowedRoles.includes(user.role)) {
            return reply.status(403).send({ error: 'Insufficient permissions' })
        }

        request.user.role = user.role
    }
}

/**
 * Generate API key for external integrations
 * @param {string} userId
 * @returns {string}
 */
export function generateApiKey(userId) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    return `tb_${userId}_${timestamp}_${random}`
}
