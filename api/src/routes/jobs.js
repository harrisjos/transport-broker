// @ts-nocheck
/**
 * Job-related API routes for creating, listing, and managing transport jobs
 */

import { jobCreateSchema, jobUpdateSchema, bidCreateSchema } from '../schemas/jobs.js'
import { calculatePlatformCharge, validateBidAmount } from '../lib/platform-charges.js'

/**
 * Job routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function jobRoutes(fastify) {

    // Get all jobs (public endpoint with filtering)
    fastify.get('/', async (request, reply) => {
        const { status, location, page = 1, limit = 20 } = request.query

        let query = fastify.db
            .selectFrom('jobs')
            .leftJoin('users as customers', 'jobs.customer_id', 'customers.id')
            .select([
                'jobs.id',
                'jobs.title',
                'jobs.description',
                'jobs.pickup_address',
                'jobs.delivery_address',
                'jobs.pickup_date',
                'jobs.delivery_date',
                'jobs.weight_kg',
                'jobs.pallet_count',
                'jobs.estimated_price',
                'jobs.status',
                'jobs.created_at',
                'customers.name as customer_name'
            ])
            .orderBy('jobs.created_at', 'desc')

        // Apply filters
        if (status) {
            query = query.where('jobs.status', '=', status)
        }

        // Pagination
        const offset = (page - 1) * limit
        query = query.limit(limit).offset(offset)

        const jobs = await query.execute()

        // Get total count for pagination
        const totalQuery = fastify.db
            .selectFrom('jobs')
            .select(fastify.db.fn.count('id').as('count'))

        if (status) {
            totalQuery.where('status', '=', status)
        }

        const [{ count }] = await totalQuery.execute()

        return {
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(count),
                pages: Math.ceil(count / limit)
            }
        }
    })

    // Get single job by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params

        const job = await fastify.db
            .selectFrom('jobs')
            .leftJoin('users as customers', 'jobs.customer_id', 'customers.id')
            .select([
                'jobs.*',
                'customers.name as customer_name',
                'customers.email as customer_email'
            ])
            .where('jobs.id', '=', id)
            .executeTakeFirst()

        if (!job) {
            return reply.status(404).send({ error: 'Job not found' })
        }

        // Get bids for this job
        const bids = await fastify.db
            .selectFrom('bids')
            .leftJoin('users as carriers', 'bids.carrier_id', 'carriers.id')
            .select([
                'bids.*',
                'carriers.name as carrier_name'
            ])
            .where('bids.job_id', '=', id)
            .orderBy('bids.created_at', 'desc')
            .execute()

        return { job, bids }
    })

    // Create new job (authenticated customers only)
    fastify.post('/', {
        preHandler: [fastify.authenticate],
        schema: {
            body: jobCreateSchema
        }
    }, async (request, reply) => {
        const jobData = request.body

        // Get user from database
        const user = await fastify.db
            .selectFrom('users')
            .select(['id', 'role'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }

        if (user.role !== 'customer') {
            return reply.status(403).send({ error: 'Only customers can create jobs' })
        }

        // Create job
        const [job] = await fastify.db
            .insertInto('jobs')
            .values({
                customer_id: user.id,
                title: jobData.title,
                description: jobData.description,
                pickup_address: jobData.pickup_address,
                delivery_address: jobData.delivery_address,
                pickup_latitude: jobData.pickup_latitude,
                pickup_longitude: jobData.pickup_longitude,
                delivery_latitude: jobData.delivery_latitude,
                delivery_longitude: jobData.delivery_longitude,
                pickup_date: new Date(jobData.pickup_date),
                delivery_date: new Date(jobData.delivery_date),
                weight_kg: jobData.weight_kg,
                pallet_count: jobData.pallet_count,
                estimated_price: jobData.estimated_price,
                status: 'open'
            })
            .returning(['id', 'title', 'status', 'created_at'])
            .execute()

        return reply.status(201).send(job)
    })

    // Update job (job owner only)
    fastify.put('/:id', {
        preHandler: [fastify.authenticate],
        schema: {
            body: jobUpdateSchema
        }
    }, async (request, reply) => {
        const { id } = request.params
        const updates = request.body

        // Get user and job
        const user = await fastify.db
            .selectFrom('users')
            .select(['id'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        const job = await fastify.db
            .selectFrom('jobs')
            .select(['customer_id', 'status'])
            .where('id', '=', id)
            .executeTakeFirst()

        if (!job) {
            return reply.status(404).send({ error: 'Job not found' })
        }

        if (job.customer_id !== user.id) {
            return reply.status(403).send({ error: 'Not authorized to update this job' })
        }

        // Update job
        const updatedJob = await fastify.db
            .updateTable('jobs')
            .set({
                ...updates,
                updated_at: new Date()
            })
            .where('id', '=', id)
            .returning(['id', 'title', 'status', 'updated_at'])
            .executeTakeFirstOrThrow()

        return updatedJob
    })

    // Create bid for job (authenticated carriers only)
    fastify.post('/:id/bids', {
        preHandler: [fastify.authenticate],
        schema: {
            body: bidCreateSchema
        }
    }, async (request, reply) => {
        const { id: jobId } = request.params
        const bidData = request.body

        // Get user
        const user = await fastify.db
            .selectFrom('users')
            .select(['id', 'role'])
            .where('firebase_uid', '=', request.user.uid)
            .executeTakeFirst()

        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }

        if (user.role !== 'carrier') {
            return reply.status(403).send({ error: 'Only carriers can submit bids' })
        }

        // Check if job exists and is open
        const job = await fastify.db
            .selectFrom('jobs')
            .select(['id', 'status'])
            .where('id', '=', jobId)
            .executeTakeFirst()

        if (!job) {
            return reply.status(404).send({ error: 'Job not found' })
        }

        if (job.status !== 'open') {
            return reply.status(400).send({ error: 'Job is no longer accepting bids' })
        }

        // Check if carrier already has a bid for this job
        const existingBid = await fastify.db
            .selectFrom('bids')
            .select(['id'])
            .where('job_id', '=', jobId)
            .where('carrier_id', '=', user.id)
            .executeTakeFirst()

        if (existingBid) {
            return reply.status(400).send({ error: 'You have already submitted a bid for this job' })
        }

        // Validate bid amount
        const validation = validateBidAmount(bidData.price)
        if (!validation.isValid) {
            return reply.status(400).send({ error: validation.error })
        }

        // Calculate platform charges
        const platformCharges = calculatePlatformCharge(bidData.price)

        // Create bid with platform charge information
        const [bid] = await fastify.db
            .insertInto('bids')
            .values({
                job_id: parseInt(jobId),
                carrier_id: user.id,
                price: bidData.price,
                platform_charge: platformCharges.platformCharge,
                carrier_net_amount: platformCharges.carrierNetAmount,
                platform_charge_percentage: platformCharges.platformChargePercentage,
                message: bidData.message,
                status: 'pending'
            })
            .returning([
                'id',
                'price',
                'platform_charge',
                'carrier_net_amount',
                'platform_charge_percentage',
                'message',
                'status',
                'created_at'
            ])
            .execute()

        return reply.status(201).send(bid)
    })
}
