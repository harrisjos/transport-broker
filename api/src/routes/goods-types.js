// @ts-nocheck
/**
 * Goods types routes
 */

/**
 * Goods types routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function goodsTypesRoutes(fastify) {

    // Get all goods types
    fastify.get('/goods-types', async (request, reply) => {
        try {
            const goodsTypes = await fastify.db
                .selectFrom('goods_types')
                .select(['id', 'name', 'description'])
                .where('is_active', '=', true)
                .orderBy('name', 'asc')
                .execute()

            return reply.send(goodsTypes)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to fetch goods types' })
        }
    })

    // Get goods type by ID
    fastify.get('/goods-types/:id', async (request, reply) => {
        try {
            const { id } = request.params

            const goodsType = await fastify.db
                .selectFrom('goods_types')
                .select(['id', 'name', 'description', 'created_at'])
                .where('id', '=', id)
                .where('is_active', '=', true)
                .executeTakeFirst()

            if (!goodsType) {
                return reply.code(404).send({ error: 'Goods type not found' })
            }

            return reply.send(goodsType)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to fetch goods type' })
        }
    })
}
