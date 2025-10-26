// @ts-nocheck
/**
 * Simplified authentication routes for SQLite without organizations
 * Compatible with existing schema
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function authRoutes(fastify, options) {

    // Login user (simplified for SQLite schema)
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body

        try {
            // Check if we're using Firebase authentication (no password column)
            const userColumns = await fastify.db
                .selectFrom('sqlite_master')
                .select('sql')
                .where('type', '=', 'table')
                .where('name', '=', 'users')
                .executeTakeFirst()

            const hasPasswordHash = userColumns?.sql?.includes('password_hash')

            if (!hasPasswordHash) {
                // For Firebase-based schema, check if user exists and simulate login
                const user = await fastify.db
                    .selectFrom('users')
                    .select([
                        'id',
                        'email',
                        'name',
                        'phone',
                        'role',
                        'profile_data',
                        'is_active'
                    ])
                    .where('email', '=', email)
                    .executeTakeFirst()

                if (!user) {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }

                // For demo purposes, accept any password for existing users
                // In production, you'd integrate with Firebase Auth
                if (password !== 'password123') {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }

                // Generate JWT token
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: '8h' }
                )

                return reply.send({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        profile_data: JSON.parse(user.profile_data || '{}'),
                        is_active: user.is_active
                    },
                    token
                })
            } else {
                // Traditional password-based authentication
                const user = await fastify.db
                    .selectFrom('users')
                    .select([
                        'id',
                        'email',
                        'name',
                        'phone',
                        'password_hash',
                        'role',
                        'is_email_verified',
                        'profile_data'
                    ])
                    .where('email', '=', email)
                    .executeTakeFirst()

                if (!user) {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(password, user.password_hash)
                if (!isPasswordValid) {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }

                // Generate JWT token
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: '8h' }
                )

                // Remove sensitive data
                const { password_hash, ...userResponse } = user

                return reply.send({
                    user: userResponse,
                    token
                })
            }

        } catch (error) {
            fastify.log.error('Login error:', error)
            return reply.status(500).send({ error: 'Internal server error during login' })
        }
    })

    // Get current user profile (simplified)
    fastify.get('/me', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const userId = request.user.uid || request.user.userId

            const user = await fastify.db
                .selectFrom('users')
                .select([
                    'id',
                    'email',
                    'name',
                    'phone',
                    'role',
                    'profile_data',
                    'is_active',
                    'created_at'
                ])
                .where('id', '=', userId)
                .executeTakeFirst()

            if (!user) {
                return reply.status(404).send({ error: 'User not found' })
            }

            return reply.send({
                user: {
                    ...user,
                    profile_data: JSON.parse(user.profile_data || '{}')
                }
            })

        } catch (error) {
            fastify.log.error('Get user profile error:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Register user (simplified)
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    role: { type: 'string', enum: ['customer', 'carrier', 'admin'], default: 'customer' }
                }
            }
        }
    }, async (request, reply) => {
        const { email, password, name, phone, role = 'customer' } = request.body

        try {
            // Check if user already exists
            const existingUser = await fastify.db
                .selectFrom('users')
                .select('id')
                .where('email', '=', email)
                .executeTakeFirst()

            if (existingUser) {
                return reply.status(400).send({ error: 'User already exists' })
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12)

            // Insert user
            const result = await fastify.db
                .insertInto('users')
                .values({
                    firebase_uid: `local_${Date.now()}`, // Dummy Firebase UID for compatibility
                    email,
                    name,
                    phone,
                    role,
                    password_hash: passwordHash,
                    profile_data: '{}',
                    is_active: 1
                })
                .execute()

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: result.insertId,
                    email,
                    role
                },
                JWT_SECRET,
                { expiresIn: '8h' }
            )

            return reply.status(201).send({
                user: {
                    id: result.insertId,
                    email,
                    name,
                    phone,
                    role
                },
                token
            })

        } catch (error) {
            fastify.log.error('Registration error:', error)
            return reply.status(500).send({ error: 'Internal server error during registration' })
        }
    })
}

export default authRoutes