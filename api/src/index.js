// @ts-check
/**
 * Main Fastify server entry point for transport broker API
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import websocket from '@fastify/websocket'

// Route imports
import jobRoutes from './routes/jobs.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'

// Middleware
import { authenticateToken } from './lib/auth.js'
import { setupDatabase } from './lib/database.js'

/**
 * Build Fastify application with all plugins and routes
 * @param {Object} opts - Fastify options
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
async function buildApp(opts = {}) {
    const fastify = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info'
        },
        ...opts
    })

    // Register CORS
    await fastify.register(cors, {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    })

    // Register JWT
    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    })

    // Register multipart for file uploads
    await fastify.register(multipart, {
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB
        }
    })

    // Register WebSocket for real-time features
    await fastify.register(websocket)

    // Add authentication decorator
    fastify.decorate('authenticate', authenticateToken)

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() }
    })

    // API routes
    await fastify.register(authRoutes, { prefix: '/api/auth' })
    await fastify.register(userRoutes, { prefix: '/api/users' })
    await fastify.register(jobRoutes, { prefix: '/api/jobs' })

    // Setup database connection
    await setupDatabase(fastify)

    return fastify
}

/**
 * Start the server
 */
async function start() {
    try {
        const app = await buildApp()

        const port = process.env.PORT || 3001
        const host = process.env.HOST || '0.0.0.0'

        await app.listen({ port: parseInt(port), host })

        app.log.info(`Server listening on http://${host}:${port}`)
    } catch (err) {
        console.error('Error starting server:', err)
        process.exit(1)
    }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    start()
}

export { buildApp }