// @ts-nocheck
/**
 * Authentication routes for user registration and login
 */

/**
 * Auth routes plugin
 * @param {any} fastify
 */
export default async function authRoutes(fastify) {

    // Register new user
    /**
     * @typedef {Object} RegisterRequestBody
     * @property {string} uid
     * @property {string} email
     * @property {string} [name]
     * @property {'customer'|'carrier'|'admin'} [role]
     *
     * @typedef {Object} User
     * @property {number|string} id
     * @property {string} email
     * @property {string} name
     * @property {'customer'|'carrier'|'admin'} role
     * @property {string|Date} created_at
     *
     * @typedef {Object} FirebaseAuthUser
     * @property {string} uid
     * @property {string} email
     *
     * @typedef {{ message: string }} LogoutResponse
     */

    fastify.post('/register',
        /**
         * @param {any} request
         * @param {any} reply
         */
        async (request, reply) => {
            const { uid, email, name, role = 'customer' } = request.body

            if (!uid || !email) {
                return reply.status(400).send({ error: 'Firebase UID and email are required' })
            }

            // Check if user already exists
            /** @type {Pick<User, 'id'> | undefined} */
            const existingUser = await fastify.db
                .selectFrom('users')
                .select(['id'])
                .where('firebase_uid', '=', uid)
                .executeTakeFirst()

            if (existingUser) {
                return reply.status(409).send({ error: 'User already exists' })
            }

            // Create new user
            /** @type {User} */
            const user = await fastify.db
                .insertInto('users')
                .values({
                    firebase_uid: uid,
                    email,
                    name: name || email.split('@')[0],
                    role: ['customer', 'carrier', 'admin'].includes(role) ? role : 'customer',
                    profile_data: {}
                })
                .returning(['id', 'email', 'name', 'role', 'created_at'])
                .executeTakeFirst()

            return reply.status(201).send(user)
        })

    // Login/verify user
    fastify.post('/login', {
        preHandler: [fastify.authenticate]
    },
        /**
         * @param {any} request
         * @param {any} reply
         * @returns {Promise<User|undefined>}
         */
        async (request, reply) => {
            // Get or create user from Firebase token
            /** @type {User|undefined} */
            let user = await fastify.db
                .selectFrom('users')
                .select(['id', 'email', 'name', 'role', 'created_at'])
                .where('firebase_uid', '=', request.user.uid)
                .executeTakeFirst()

            // If user doesn't exist, create them
            if (!user) {
                /** @type {User} */
                const newUser = await fastify.db
                    .insertInto('users')
                    .values({
                        firebase_uid: request.user.uid,
                        email: request.user.email,
                        name: request.user.email.split('@')[0],
                        role: 'customer',
                        profile_data: {}
                    })
                    .returning(['id', 'email', 'name', 'role', 'created_at'])
                    .executeTakeFirst()

                user = newUser
            }

            return user
        })

    // Logout (client-side Firebase logout)
    fastify.post('/logout',
        /**
         * @param {any} request
         * @param {any} reply
         * @returns {Promise<LogoutResponse>}
         */
        async (request, reply) => {
            // Firebase handles token invalidation client-side
            return { message: 'Logged out successfully' }
        })
}
