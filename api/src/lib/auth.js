// @ts-check
/**
 * Authentication middleware and utilities for JWT token validation
 */

import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
}

/**
 * Fastify middleware for JWT authentication
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function authenticateToken(request, reply) {
    try {
        const authHeader = request.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return reply.status(401).send({ error: 'Access token required' })
        }

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token)

        // Add user info to request
        request.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        }
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