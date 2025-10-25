// @ts-check
/**
 * Authentication routes for user registration and login
 */

/**
 * Auth routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function authRoutes(fastify) {

    // Register new user
    fastify.post('/register', async (request, reply) => {
        const { uid, email, name, role = 'customer' } = request.body

        if (!uid || !email) {
            return reply.status(400).send({ error: 'Firebase UID and email are required' })
        }

        // Check if user already exists
        const existingUser = await fastify.db
            .selectFrom('users')
            .select(['id'])
            .where('firebase_uid', '=', uid)
            .executeTakeFirst()

        if (existingUser) {
            return reply.status(409).send({ error: 'User already exists' })
        }

        // Create new user
        const [user] = await fastify.db
            .insertInto('users')
            .values({
                firebase_uid: uid,
                email,
                name: name || email.split('@')[0],
                role: ['customer', 'carrier', 'admin'].includes(role) ? role : 'customer',
                profile_data: {}
            })
            .returning(['id', 'email', 'name', 'role', 'created_at'])
            .execute()

        return reply.status(201).send(user)
    })

    // Login/verify user
    fastify.post('/login', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        // Get or create user from Firebase token
        let user = await fastify.db
            .selectFrom('users')
            .select(['id', 'email', 'name', 'role', 'created_at'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        // If user doesn't exist, create them
        if (!user) {
            const [newUser] = await fastify.db
                .insertInto('users')
                .values({
                    firebase_uid: request.user.uid,
                    email: request.user.email,
                    name: request.user.email.split('@')[0],
                    role: 'customer',
                    profile_data: {}
                })
                .returning(['id', 'email', 'name', 'role', 'created_at'])
                .execute()

            user = newUser
        }

        return user
    })

    // Logout (client-side Firebase logout)
    fastify.post('/logout', async (request, reply) => {
        // Firebase handles token invalidation client-side
        return { message: 'Logged out successfully' }
    })
}