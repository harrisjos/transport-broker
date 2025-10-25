// @ts-check
/**
 * User-related API routes for profile management
 */

/**
 * User routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function userRoutes(fastify) {

    // Get user profile (authenticated)
    fastify.get('/profile', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = await fastify.db
            .selectFrom('users')
            .select(['id', 'email', 'name', 'phone', 'role', 'profile_data', 'created_at'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }

        return user
    })

    // Update user profile (authenticated)
    fastify.put('/profile', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const { name, phone, profile_data } = request.body

        const updatedUser = await fastify.db
            .updateTable('users')
            .set({
                name,
                phone,
                profile_data,
                updated_at: new Date()
            })
            .where('firebase_uid', '=', request.user.uid)
            .returning(['id', 'email', 'name', 'phone', 'role', 'profile_data', 'updated_at'])
            .executeTakeFirst()

        if (!updatedUser) {
            return reply.status(404).send({ error: 'User not found' })
        }

        return updatedUser
    })

    // Get user's jobs (authenticated)
    fastify.get('/jobs', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = await fastify.db
            .selectFrom('users')
            .select(['id', 'role'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }

        let jobs
        if (user.role === 'customer') {
            // Get jobs created by customer
            jobs = await fastify.db
                .selectFrom('jobs')
                .select([
                    'id', 'title', 'pickup_address', 'delivery_address',
                    'pickup_date', 'delivery_date', 'status', 'created_at'
                ])
                .where('customer_id', '=', user.id)
                .orderBy('created_at', 'desc')
                .execute()
        } else if (user.role === 'carrier') {
            // Get jobs with bids from carrier
            jobs = await fastify.db
                .selectFrom('jobs')
                .innerJoin('bids', 'jobs.id', 'bids.job_id')
                .select([
                    'jobs.id', 'jobs.title', 'jobs.pickup_address', 'jobs.delivery_address',
                    'jobs.pickup_date', 'jobs.delivery_date', 'jobs.status as job_status',
                    'bids.price', 'bids.status as bid_status', 'bids.created_at'
                ])
                .where('bids.carrier_id', '=', user.id)
                .orderBy('bids.created_at', 'desc')
                .execute()
        }

        return { jobs }
    })
}