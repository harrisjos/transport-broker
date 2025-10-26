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

            // Generate salt and hash password
            const passwordSalt = await bcrypt.genSalt(SALT_ROUNDS)
            const passwordHash = await bcrypt.hash(password, passwordSalt)

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
                        password_salt: passwordSalt,
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
            // Find user (simple approach)
            const user = await fastify.db
                .selectFrom('users')
                .selectAll()
                .where('email', '=', email)
                .executeTakeFirst()

            if (!user) {
                return reply.status(401).send({ error: 'Invalid email or password' })
            }            // For demo purposes - if no password_hash column exists, check for test credentials
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

            // Get user's organization info for JWT
            const userOrg = await fastify.db
                .selectFrom('user_organizations')
                .leftJoin('organizations', 'user_organizations.organization_id', 'organizations.id')
                .where('user_id', '=', user.id)
                .select([
                    'user_organizations.organization_id',
                    'user_organizations.role as org_role',
                    'organizations.organization_type'
                ])
                .executeTakeFirst()

            // Generate JWT token with organization data
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role || 'customer',
                    organizationId: userOrg?.organization_id || null,
                    orgRole: userOrg?.org_role || null,
                    orgType: userOrg?.organization_type || null
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

            // Fetch base user information first so we can return something even if joins fail
            let baseUser
            try {
                baseUser = await fastify.db
                    .selectFrom('users')
                    .select(['id', 'email', 'name', 'phone', 'is_email_verified', 'last_login_at'])
                    .where('id', '=', userId)
                    .executeTakeFirst()
            } catch (userColumnError) {
                fastify.log.warn({ userColumnError }, 'Users table missing extended columns; falling back to minimal profile select')
                baseUser = await fastify.db
                    .selectFrom('users')
                    .select(['id', 'email', 'name', 'phone'])
                    .where('id', '=', userId)
                    .executeTakeFirst()
            }

            if (!baseUser) {
                return reply.status(404).send({ error: 'User not found' })
            }

            let organizations = []
            let organizationType

            // Attempt to load organizations if the linking tables/columns exist
            try {
                organizations = await fastify.db
                    .selectFrom('user_organizations')
                    .innerJoin('organizations', 'user_organizations.organization_id', 'organizations.id')
                    .select([
                        'organizations.id as id',
                        'organizations.name as name',
                        'organizations.organization_type as type',
                        'user_organizations.role as role',
                        'user_organizations.is_primary as is_primary'
                    ])
                    .where('user_organizations.user_id', '=', userId)
                    .execute()

                const primaryOrg = organizations.find(org => org.is_primary)
                organizationType = primaryOrg ? primaryOrg.type : organizations[0]?.type
            } catch (orgError) {
                // If the join fails due to missing tables/columns, log and continue with empty orgs
                fastify.log.warn({ orgError }, 'Organization data unavailable; continuing with base user info')
                organizations = []
                organizationType = undefined
            }

            return reply.send({
                id: baseUser.id,
                email: baseUser.email,
                name: baseUser.name,
                phone: baseUser.phone,
                is_email_verified: baseUser.is_email_verified ?? false,
                last_login_at: baseUser.last_login_at ?? null,
                organizationType,
                organisationType: organizationType,
                organizations,
                organisations: organizations
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
