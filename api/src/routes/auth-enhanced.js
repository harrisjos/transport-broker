// @ts-nocheck
/**
 * Authentication routes for user registration and login with email/password
 */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

/**
 * Enhanced Auth routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function authRoutes(fastify) {

    // Register new user with organization
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'name', 'organizationName', 'organizationType'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string', minLength: 1 },
                    phone: { type: 'string' },
                    organizationName: { type: 'string', minLength: 1 },
                    organizationType: { type: 'string', enum: ['shipper', 'carrier', 'both'] },
                    organizationDetails: {
                        type: 'object',
                        properties: {
                            tradingName: { type: 'string' },
                            abn: { type: 'string' },
                            streetAddress: { type: 'string' },
                            suburb: { type: 'string' },
                            postcode: { type: 'string' },
                            state: { type: 'string' },
                            phone: { type: 'string' },
                            email: { type: 'string', format: 'email' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            email,
            password,
            name,
            phone,
            organizationName,
            organizationType,
            organizationDetails = {},
            // Australian spelling support
            organisationName,
            organisationType,
            organisationDetails = {}
        } = request.body

        // Use Australian spelling if provided, fallback to American
        const orgName = organisationName || organizationName
        const orgType = organisationType || organizationType
        const orgDetails = Object.keys(organisationDetails).length > 0 ? organisationDetails : organizationDetails

        try {
            // Check if user already exists
            const existingUser = await fastify.db
                .selectFrom('users')
                .select(['id'])
                .where('email', '=', email)
                .executeTakeFirst()

            if (existingUser) {
                return reply.status(409).send({ error: 'User already exists with this email' })
            }

            // Validate password requirements
            if (password.length < 8) {
                return reply.status(400).send({ error: 'Password must be at least 8 characters long' })
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

            // Start transaction
            const result = await fastify.db.transaction().execute(async (trx) => {
                // Create organization
                const [organization] = await trx
                    .insertInto('organizations')
                    .values({
                        name: orgName,
                        trading_name: orgDetails.tradingName || orgName,
                        organization_type: orgType,
                        abn: orgDetails.abn,
                        street_address: orgDetails.streetAddress,
                        suburb: orgDetails.suburb,
                        postcode: orgDetails.postcode,
                        state: orgDetails.state,
                        phone: orgDetails.phone || phone,
                        email: orgDetails.email || email,
                        is_active: true
                    })
                    .returning(['id', 'name', 'organization_type'])
                    .execute()

                // Create user
                const [user] = await trx
                    .insertInto('users')
                    .values({
                        email,
                        name,
                        phone,
                        password_hash: passwordHash,
                        role: 'customer', // Default role, will be overridden by organization role
                        is_email_verified: false,
                        profile_data: {}
                    })
                    .returning(['id', 'email', 'name', 'phone', 'created_at'])
                    .execute()

                // Link user to organization as admin
                await trx
                    .insertInto('user_organizations')
                    .values({
                        user_id: user.id,
                        organization_id: organization.id,
                        role: 'admin',
                        is_primary: true
                    })
                    .execute()

                return { user, organization }
            })

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: result.user.id,
                    email: result.user.email,
                    organizationId: result.organization.id,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            )

            return reply.status(201).send({
                user: result.user,
                organization: result.organization,
                token
            })

        } catch (error) {
            fastify.log.error('Registration error:', error)
            return reply.status(500).send({ error: 'Internal server error during registration' })
        }
    })

    // Login user
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

        // Defensive: log and validate email
        fastify.log.info(`Login attempt: email=${JSON.stringify(email)}`)
        if (typeof email !== 'string' || !email.trim()) {
            fastify.log.error('Login error: email is not a valid string', { email })
            return reply.status(400).send({ error: 'Invalid email format' })
        }

        try {
            // Find user (simplified for SQLite without organizations)
            const user = await fastify.db
                .selectFrom('users')
                .select([
                    'users.id',
                    'users.email',
                    'users.name',
                    'users.phone',
                    'users.password_hash',
                    'users.role'
                ])
                .where('users.email', '=', email)
                .executeTakeFirst()

            if (!user) {
                return reply.status(401).send({ error: 'Invalid email or password' })
            }

            // For demo purposes - if no password_hash column exists, check for test credentials
            if (!user.password_hash) {
                if (password !== 'password123') {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }
            } else {
                // Verify password
                const isPasswordValid = await bcrypt.compare(password, user.password_hash)
                if (!isPasswordValid) {
                    return reply.status(401).send({ error: 'Invalid email or password' })
                }
            }

            // Update last login (skip if no last_login_at column)
            try {
                await fastify.db
                    .updateTable('users')
                    .set({ updated_at: new Date() })
                    .where('id', '=', user.id)
                    .execute()
            } catch (error) {
                // Ignore update errors for now
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role || 'customer'
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

        } catch (error) {
            fastify.log.error('Login error:', error)
            return reply.status(500).send({ error: 'Internal server error during login' })
        }
    })

    // Get current user profile
    fastify.get('/me', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const userId = request.user.uid || request.user.userId

            const userWithOrgs = await fastify.db
                .selectFrom('users')
                .innerJoin('user_organizations', 'users.id', 'user_organizations.user_id')
                .innerJoin('organizations', 'user_organizations.organization_id', 'organizations.id')
                .select([
                    'users.id',
                    'users.email',
                    'users.name',
                    'users.phone',
                    'users.is_email_verified',
                    'users.last_login_at',
                    'user_organizations.role as org_role',
                    'user_organizations.is_primary',
                    'organizations.id as organization_id',
                    'organizations.name as organization_name',
                    'organizations.organization_type'
                ])
                .where('users.id', '=', userId)
                .execute()

            if (!userWithOrgs.length) {
                return reply.status(404).send({ error: 'User not found' })
            }

            const user = userWithOrgs[0]
            const organizations = userWithOrgs.map(row => ({
                id: row.organization_id,
                name: row.organization_name,
                type: row.organization_type,
                role: row.org_role,
                is_primary: row.is_primary
            }))

            // Get primary organization type for easier frontend access
            const primaryOrg = organizations.find(org => org.is_primary)
            const organizationType = primaryOrg ? primaryOrg.type : organizations[0]?.type

            return reply.send({
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                is_email_verified: user.is_email_verified,
                last_login_at: user.last_login_at,
                organizationType, // Add this for easier frontend access (American spelling for compatibility)
                organisationType: organizationType, // Australian spelling
                organizations,
                organisations: organizations // Australian spelling
            })

        } catch (error) {
            fastify.log.error('Get user profile error:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Update user profile
    fastify.put('/profile', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    organization: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', minLength: 1 },
                            abn: { type: 'string' },
                            address: { type: 'string' },
                            organizationType: { type: 'string', enum: ['shipper', 'carrier', 'both'] }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const userId = request.user.uid || request.user.userId
            const { name, email, phone, organization, organisation } = request.body

            // Use Australian spelling if provided, fallback to American
            const orgData = organisation || organization

            // Update user table
            await fastify.db
                .updateTable('users')
                .set({
                    name,
                    email,
                    phone,
                    updated_at: new Date()
                })
                .where('id', '=', userId)
                .execute()

            // Update organization if provided
            if (orgData) {
                // Get user's primary organization
                const userOrg = await fastify.db
                    .selectFrom('user_organizations')
                    .innerJoin('organizations', 'user_organizations.organization_id', 'organizations.id')
                    .select(['organizations.id', 'organizations.name'])
                    .where('user_organizations.user_id', '=', userId)
                    .where('user_organizations.is_primary', '=', true)
                    .executeTakeFirst()

                if (userOrg) {
                    await fastify.db
                        .updateTable('organizations')
                        .set({
                            name: orgData.name,
                            abn: orgData.abn,
                            address: orgData.address,
                            organization_type: orgData.organisationType || orgData.organizationType,
                            updated_at: new Date()
                        })
                        .where('id', '=', userOrg.id)
                        .execute()
                }
            }

            return reply.send({ message: 'Profile updated successfully' })

        } catch (error) {
            fastify.log.error('Update profile error:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Password reset request
    fastify.post('/reset-password', {
        schema: {
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { email } = request.body

            // Check if user exists
            const user = await fastify.db
                .selectFrom('users')
                .select(['id', 'email', 'name'])
                .where('email', '=', email)
                .executeTakeFirst()

            if (!user) {
                // For security, always return success even if user doesn't exist
                // This prevents email enumeration attacks
                return reply.send({
                    message: 'If an account with that email exists, password reset instructions have been sent.'
                })
            }

            // In a real application, you would:
            // 1. Generate a secure reset token
            // 2. Store the token with expiration in database
            // 3. Send email with reset link containing the token

            // For this demo, we'll simulate sending an email
            fastify.log.info(`Password reset requested for: ${email}`)

            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            return reply.send({
                message: 'If an account with that email exists, password reset instructions have been sent.'
            })

        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({
                message: 'Failed to process password reset request'
            })
        }
    })

    // Logout (for completeness, mainly client-side token removal)
    fastify.post('/logout', async (request, reply) => {
        // In a JWT setup, logout is mainly handled client-side by removing the token
        // We could implement token blacklisting here if needed
        return reply.send({ message: 'Logged out successfully' })
    })
}
