// @ts-check
/**
 * Database connection and query builder setup using Kysely
 */

import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'

const { Pool } = pg

/**
 * Database schema interface for type safety
 * @typedef {Object} Database
 * @property {UsersTable} users
 * @property {JobsTable} jobs
 * @property {BidsTable} bids
 * @property {MessagesTable} messages
 * @property {RatingsTable} ratings
 */

/**
 * @typedef {Object} UsersTable
 * @property {number} id
 * @property {string} firebase_uid
 * @property {string} email
 * @property {string} name
 * @property {string} phone
 * @property {'customer' | 'carrier' | 'admin'} role
 * @property {Object} profile_data
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} JobsTable
 * @property {number} id
 * @property {number} customer_id
 * @property {string} title
 * @property {string} description
 * @property {string} pickup_address
 * @property {string} delivery_address
 * @property {number} pickup_latitude
 * @property {number} pickup_longitude
 * @property {number} delivery_latitude
 * @property {number} delivery_longitude
 * @property {Date} pickup_date
 * @property {Date} delivery_date
 * @property {number} weight_kg
 * @property {number} pallet_count
 * @property {number} estimated_price
 * @property {'open' | 'accepted' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'} status
 * @property {number} accepted_bid_id
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} BidsTable
 * @property {number} id
 * @property {number} job_id
 * @property {number} carrier_id
 * @property {number} price
 * @property {string} message
 * @property {'pending' | 'accepted' | 'rejected'} status
 * @property {Date} created_at
 */

/**
 * Create database connection pool
 * @returns {Kysely<Database>}
 */
function createDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'transport_broker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })

    const dialect = new PostgresDialect({
        pool
    })

    return new Kysely({
        dialect,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
    })
}

/**
 * Setup database connection on Fastify instance
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function setupDatabase(fastify) {
    const db = createDatabase()

    // Add database to Fastify context
    fastify.decorate('db', db)

    // Test connection
    try {
        await db.selectFrom('users').select('id').limit(1).execute()
        fastify.log.info('Database connection established')
    } catch (error) {
        fastify.log.error('Database connection failed:', error)
        throw error
    }

    // Close connection when app shuts down
    fastify.addHook('onClose', async () => {
        await db.destroy()
    })
}

export { createDatabase }