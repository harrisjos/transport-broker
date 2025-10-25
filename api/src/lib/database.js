// @ts-nocheck
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
 * @property {OrganizationsTable} organizations
 * @property {UserOrganizationsTable} user_organizations
 * @property {BookingsTable} bookings
 * @property {BidsTable} bids
 * @property {MessagesTable} messages
 * @property {RatingsTable} ratings
 * @property {FilesTable} files
 * @property {GoodsTypesTable} goods_types
 * @property {ZonesTable} zones
 * @property {PostcodesTable} postcodes
 * @property {RatesTable} rates
 */

/**
 * @typedef {Object} UsersTable
 * @property {number} id
 * @property {string} firebase_uid
 * @property {string} email
 * @property {string} name
 * @property {string} phone
 * @property {'customer' | 'carrier' | 'admin'} role
 * @property {string} password_hash
 * @property {boolean} is_email_verified
 * @property {Date} last_login_at
 * @property {Object} profile_data
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} OrganizationsTable
 * @property {number} id
 * @property {string} name
 * @property {string} trading_name
 * @property {string} abn
 * @property {string} acn
 * @property {'shipper' | 'carrier' | 'both'} organization_type
 * @property {string} street_address
 * @property {string} building
 * @property {string} suburb
 * @property {string} postcode
 * @property {string} state
 * @property {string} country
 * @property {string} phone
 * @property {string} email
 * @property {string} website
 * @property {string} description
 * @property {Object} business_hours
 * @property {boolean} is_active
 * @property {boolean} is_verified
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} UserOrganizationsTable
 * @property {number} id
 * @property {number} user_id
 * @property {number} organization_id
 * @property {'admin' | 'user'} role
 * @property {boolean} is_primary
 * @property {Date} joined_at
 */

/**
 * @typedef {Object} BookingsTable
 * @property {number} id
 * @property {number} shipper_user_id
 * @property {number} shipper_org_id
 * @property {string} origin_name
 * @property {string} origin_street_address
 * @property {string} origin_building
 * @property {string} origin_suburb
 * @property {string} origin_postcode
 * @property {string} origin_state
 * @property {string} origin_country
 * @property {number} origin_latitude
 * @property {number} origin_longitude
 * @property {string} destination_name
 * @property {string} destination_street_address
 * @property {string} destination_building
 * @property {string} destination_suburb
 * @property {string} destination_postcode
 * @property {string} destination_state
 * @property {string} destination_country
 * @property {number} destination_latitude
 * @property {number} destination_longitude
 * @property {Array} pallets
 * @property {number} budget_minimum
 * @property {number} budget_maximum
 * @property {string} description
 * @property {number} goods_type_id
 * @property {Date} collection_date_minimum
 * @property {Date} collection_date_requested
 * @property {Date} collection_date_maximum
 * @property {Date} delivery_date_minimum
 * @property {Date} delivery_date_requested
 * @property {Date} delivery_date_maximum
 * @property {string} special_requirements
 * @property {boolean} requires_tailgate
 * @property {boolean} requires_crane
 * @property {boolean} requires_forklift
 * @property {'draft' | 'open' | 'in_bidding' | 'awarded' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'} status
 * @property {number} selected_bid_id
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} published_at
 * @property {Date} closed_at
 */

/**
 * @typedef {Object} BidsTable
 * @property {number} id
 * @property {number} booking_id
 * @property {number} carrier_user_id
 * @property {number} carrier_org_id
 * @property {number} total_price
 * @property {Object} price_breakdown
 * @property {Date} proposed_collection_date
 * @property {Date} proposed_delivery_date
 * @property {string} message
 * @property {string} terms_and_conditions
 * @property {string} vehicle_type
 * @property {Array} equipment_available
 * @property {'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'} status
 * @property {Date} valid_until
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} responded_at
 */

/**
 * @typedef {Object} GoodsTypesTable
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} is_custom
 * @property {number} organization_id
 * @property {boolean} is_active
 * @property {Date} created_at
 */

/**
 * @typedef {Object} ZonesTable
 * @property {number} id
 * @property {string} zone_name
 * @property {string} description
 * @property {boolean} is_active
 * @property {Date} created_at
 */

/**
 * @typedef {Object} PostcodesTable
 * @property {number} id
 * @property {string} postcode
 * @property {string} suburb
 * @property {string} state
 * @property {string} country
 * @property {number} zone_id
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} RatesTable
 * @property {number} id
 * @property {number} carrier_id
 * @property {number} organization_id
 * @property {number} origin_zone_id
 * @property {number} destination_zone_id
 * @property {number} base_rate
 * @property {number} per_kg_rate
 * @property {number} per_pallet_rate
 * @property {number} max_weight_kg
 * @property {number} max_length_mm
 * @property {number} max_width_mm
 * @property {number} max_height_mm
 * @property {number} fuel_surcharge_percentage
 * @property {number} minimum_charge
 * @property {Date} effective_from
 * @property {Date} effective_to
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} MessagesTable
 * @property {number} id
 * @property {number} booking_id
 * @property {number} sender_id
 * @property {string} content
 * @property {'text' | 'image' | 'document'} message_type
 * @property {string} file_url
 * @property {Date} read_at
 * @property {Date} created_at
 */

/**
 * @typedef {Object} RatingsTable
 * @property {number} id
 * @property {number} booking_id
 * @property {number} rater_id
 * @property {number} rated_id
 * @property {number} rating
 * @property {string} comment
 * @property {Date} created_at
 */

/**
 * @typedef {Object} FilesTable
 * @property {number} id
 * @property {number} booking_id
 * @property {number} uploader_id
 * @property {string} filename
 * @property {string} original_filename
 * @property {number} file_size
 * @property {string} mime_type
 * @property {string} storage_url
 * @property {'pod' | 'invoice' | 'manifest' | 'photo' | 'other'} file_type
 * @property {Date} created_at
 */

/**
 * @typedef {Object} JobsTable - DEPRECATED: Use BookingsTable instead
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
