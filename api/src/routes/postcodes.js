// @ts-nocheck
/**
 * Postcodes routes for address lookup
 */

/**
 * Postcodes routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function postcodesRoutes(fastify) {

    // Search postcodes by query (suburb name, postcode, etc.)
    fastify.get('/postcodes/search', async (request, reply) => {
        try {
            const { q } = request.query

            if (!q || q.length < 2) {
                return reply.send([])
            }

            const searchTerm = `%${q.toLowerCase()}%`

            const postcodes = await fastify.db
                .selectFrom('postcodes')
                .select(['postcode', 'suburb', 'state'])
                .where((eb) => eb.or([
                    eb(fastify.db.fn('lower', ['suburb']), 'like', searchTerm),
                    eb('postcode', 'like', `${q}%`)
                ]))
                .orderBy('suburb', 'asc')
                .limit(10)
                .execute()

            return reply.send(postcodes)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to search postcodes' })
        }
    })

    // Lookup suburb and state by postcode
    fastify.get('/postcodes/lookup/:postcode', async (request, reply) => {
        try {
            const { postcode } = request.params

            const postcodeData = await fastify.db
                .selectFrom('postcodes')
                .select(['postcode', 'suburb', 'state'])
                .where('postcode', '=', postcode)
                .execute()

            return reply.send(postcodeData)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to lookup postcode' })
        }
    })

    // Get all postcodes for a specific state
    fastify.get('/postcodes/state/:state', async (request, reply) => {
        try {
            const { state } = request.params
            const { limit = 100 } = request.query

            const postcodes = await fastify.db
                .selectFrom('postcodes')
                .select(['postcode', 'suburb', 'state'])
                .where('state', '=', state.toUpperCase())
                .orderBy('suburb', 'asc')
                .limit(limit)
                .execute()

            return reply.send(postcodes)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to fetch postcodes for state' })
        }
    })
}
