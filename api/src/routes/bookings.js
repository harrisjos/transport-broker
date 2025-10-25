// @ts-nocheck
/**
 * Enhanced Bookings routes for transport requests
 * Updated to match new booking form structure from Update 1.02
 */

/**
 * Bookings routes plugin
 * @param {any} fastify
 */
export default async function bookingRoutes(fastify) {

    // Get all bookings (with filtering for carriers vs shippers)
    /**
     * @typedef {Object} BookingQuery
     * @property {string} [status]
     * @property {number|string} [goods_type_id]
     * @property {string} [origin_postcode]
     * @property {string} [destination_postcode]
     * @property {number|string} [page]
     * @property {number|string} [limit]
     * @property {string|boolean} [my_jobs]
     *
     * @typedef {Object} RequestUser
     * @property {string} role
     * @property {number} organizationId
     * @property {number} userId
     *
     * @typedef {Object} Booking
     * @property {number} id
     * @property {string} [origin_company]
     * @property {string} [origin_suburb]
     * @property {string} [origin_postcode]
     * @property {string} [origin_state]
     * @property {string} [destination_company]
     * @property {string} [destination_suburb]
     * @property {string} [destination_postcode]
     * @property {string} [destination_state]
     * @property {number} [standard_pallets]
     * @property {any} [non_standard_pallets]
     * @property {number} [total_weight]
     * @property {number} [total_volume]
     * @property {string} [description]
     * @property {string} [goods_type_name]
     * @property {string} [pickup_date]
     * @property {string} [delivery_date]
     * @property {string} [status]
     * @property {string} [created_at]
     * @property {string} [updated_at]
     * @property {string} [shipper_organization_name]
     * @property {number} [budget_amount]
     * @property {string} [budget_currency]
     * @property {string} [budget_notes]
     * @property {string} [origin_contact]
     * @property {string} [origin_phone]
     * @property {string} [origin_email]
     * @property {string} [origin_address]
     * @property {string} [origin_special_instructions]
     * @property {string} [destination_contact]
     * @property {string} [destination_phone]
     * @property {string} [destination_email]
     * @property {string} [destination_address]
     * @property {string} [destination_special_instructions]
     */

    fastify.get('/bookings', {
        preHandler: [fastify.authenticate]
    },
    /**
     * @param {any} request
     * @param {any} reply
     */
    async (request, reply) => {
        try {
            const { role, organizationId, userId } = /** @type {RequestUser} */ (request.user)
            const {
                status,
                goods_type_id,
                origin_postcode,
                destination_postcode,
                page = 1,
                limit = 20,
                my_jobs
            } = /** @type {BookingQuery} */ (request.query)

            let query = fastify.db
                .selectFrom('bookings')
                .leftJoin('goods_types', 'bookings.goods_type_id', 'goods_types.id')
                .leftJoin('users', 'bookings.shipper_user_id', 'users.id')
                .leftJoin('organizations', 'bookings.shipper_org_id', 'organizations.id')

            // Get the user's organization info to determine access
            const userOrg = await fastify.db
                .selectFrom('user_organizations')
                .where('user_id', '=', userId)
                .selectAll()
                .executeTakeFirst()

            if (!userOrg) {
                return reply.code(403).send({ error: 'User organization not found' })
            }

            const isShipper = userOrg.organization_type === 'shipper' || userOrg.organization_type === 'both'
            const isCarrier = userOrg.organization_type === 'carrier' || userOrg.organization_type === 'both'

            // Carriers see all open bookings (but without budget information)
            if (isCarrier && !isShipper) {
                query = query.select([
                    'bookings.id',
                    'bookings.origin_company',
                    'bookings.origin_suburb',
                    'bookings.origin_postcode',
                    'bookings.origin_state',
                    'bookings.destination_company',
                    'bookings.destination_suburb',
                    'bookings.destination_postcode',
                    'bookings.destination_state',
                    'bookings.standard_pallets',
                    'bookings.non_standard_pallets',
                    'bookings.total_weight',
                    'bookings.total_volume',
                    'bookings.description',
                    'goods_types.name as goods_type_name',
                    'bookings.pickup_date',
                    'bookings.pickup_time_from',
                    'bookings.pickup_time_to',
                    'bookings.delivery_date',
                    'bookings.delivery_time_from',
                    'bookings.delivery_time_to',
                    'bookings.special_handling',
                    'bookings.dangerous_goods',
                    'bookings.fragile_items',
                    'bookings.insurance_required',
                    'bookings.tracking_required',
                    'bookings.status',
                    'bookings.created_at',
                    'organizations.name as shipper_organization_name'
                ])
                    .where('bookings.status', 'in', ['active', 'in_bidding'])
            } else {
                // Shippers see their own bookings with full details including budget
                query = query.select([
                    'bookings.id',
                    'bookings.origin_company',
                    'bookings.origin_contact',
                    'bookings.origin_phone',
                    'bookings.origin_email',
                    'bookings.origin_address',
                    'bookings.origin_suburb',
                    'bookings.origin_postcode',
                    'bookings.origin_state',
                    'bookings.origin_special_instructions',
                    'bookings.destination_company',
                    'bookings.destination_contact',
                    'bookings.destination_phone',
                    'bookings.destination_email',
                    'bookings.destination_address',
                    'bookings.destination_suburb',
                    'bookings.destination_postcode',
                    'bookings.destination_state',
                    'bookings.destination_special_instructions',
                    'bookings.standard_pallets',
                    'bookings.non_standard_pallets',
                    'bookings.total_weight',
                    'bookings.total_volume',
                    'bookings.budget_amount',
                    'bookings.budget_currency',
                    'bookings.budget_notes',
                    'bookings.description',
                    'goods_types.name as goods_type_name',
                    'bookings.pickup_date',
                    'bookings.pickup_time_from',
                    'bookings.pickup_time_to',
                    'bookings.delivery_date',
                    'bookings.delivery_time_from',
                    'bookings.delivery_time_to',
                    'bookings.timing_flexible',
                    'bookings.special_handling',
                    'bookings.dangerous_goods',
                    'bookings.fragile_items',
                    'bookings.insurance_required',
                    'bookings.tracking_required',
                    'bookings.status',
                    'bookings.created_at',
                    'bookings.updated_at'
                ])

                // Filter by user's organization
                if (my_jobs === 'true') {
                    // For dashboard: only show user's own jobs
                    query = query.where('bookings.shipper_user_id', '=', userId)
                } else {
                    // For regular booking list: show all jobs from user's organization
                    query = query.where('bookings.shipper_org_id', '=', organizationId)
                }
            }

            // Apply filters
            if (status) {
                query = query.where('bookings.status', '=', status)
            }
            if (goods_type_id) {
                query = query.where('bookings.goods_type_id', '=', goods_type_id)
            }
            if (origin_postcode) {
                query = query.where('bookings.origin_postcode', '=', origin_postcode)
            }
            if (destination_postcode) {
                query = query.where('bookings.destination_postcode', '=', destination_postcode)
            }

            // Pagination
            const pageNum = Number(page)
            const limitNum = Number(limit) || 1
            const offset = (pageNum - 1) * limitNum
            query = query.limit(limitNum).offset(offset).orderBy('bookings.created_at', 'desc')

            /** @type {Booking[]} */
            const bookings = await query.execute()

            // Get total count for pagination
            let countQuery = fastify.db
                .selectFrom('bookings')
                .leftJoin('goods_types', 'bookings.goods_type_id', 'goods_types.id')

            if (isCarrier && !isShipper) {
                countQuery = countQuery.where('bookings.status', 'in', ['active', 'in_bidding'])
            } else {
                countQuery = countQuery.where('bookings.shipper_org_id', '=', organizationId)
            }

            // Apply same filters to count
            if (status) countQuery = countQuery.where('bookings.status', '=', status)
            if (goods_type_id) countQuery = countQuery.where('bookings.goods_type_id', '=', goods_type_id)
            if (origin_postcode) countQuery = countQuery.where('bookings.origin_postcode', '=', origin_postcode)
            if (destination_postcode) countQuery = countQuery.where('bookings.destination_postcode', '=', destination_postcode)

            /** @type {{ total: string | number } | undefined} */
            const totalResult = await countQuery.select(fastify.db.fn.count('bookings.id').as('total')).executeTakeFirst()
            const total = Number(totalResult?.total ?? 0)

            return reply.send({
                bookings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            })
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to fetch bookings' })
        }
    })

    // Get single booking by ID
    /**
     * @typedef {Object} UserOrganization
     * @property {number} user_id
     * @property {number} organization_id
     * @property {'shipper'|'carrier'|'both'|string} organization_type
     */

    fastify.get('/bookings/:id', {
        preHandler: [fastify.authenticate]
    },
    /**
     * @param {any} request
     * @param {any} reply
     */
    async (request, reply) => {
        try {
            const { id } = request.params
            const { organizationId, userId } = request.user

            // Get the user's organization info to determine access
            const userOrg = /** @type {UserOrganization | undefined} */ (await fastify.db
                .selectFrom('user_organizations')
                .where('user_id', '=', userId)
                .selectAll()
                .executeTakeFirst())

            if (!userOrg) {
                return reply.code(403).send({ error: 'User organization not found' })
            }

            const isShipper = userOrg.organization_type === 'shipper' || userOrg.organization_type === 'both'
            const isCarrier = userOrg.organization_type === 'carrier' || userOrg.organization_type === 'both'

            let query = fastify.db
                .selectFrom('bookings')
                .leftJoin('goods_types', 'bookings.goods_type_id', 'goods_types.id')
                .leftJoin('users', 'bookings.shipper_user_id', 'users.id')
                .leftJoin('organizations', 'bookings.shipper_org_id', 'organizations.id')
                .where('bookings.id', '=', id)

            if (isCarrier && !isShipper) {
                // Carriers can see active bookings without budget info
                query = query.select([
                    'bookings.id',
                    'bookings.origin_company',
                    'bookings.origin_contact',
                    'bookings.origin_phone',
                    'bookings.origin_address',
                    'bookings.origin_suburb',
                    'bookings.origin_postcode',
                    'bookings.origin_state',
                    'bookings.origin_special_instructions',
                    'bookings.destination_company',
                    'bookings.destination_contact',
                    'bookings.destination_phone',
                    'bookings.destination_address',
                    'bookings.destination_suburb',
                    'bookings.destination_postcode',
                    'bookings.destination_state',
                    'bookings.destination_special_instructions',
                    'bookings.standard_pallets',
                    'bookings.non_standard_pallets',
                    'bookings.total_weight',
                    'bookings.total_volume',
                    'bookings.description',
                    'goods_types.name as goods_type_name',
                    'bookings.pickup_date',
                    'bookings.pickup_time_from',
                    'bookings.pickup_time_to',
                    'bookings.delivery_date',
                    'bookings.delivery_time_from',
                    'bookings.delivery_time_to',
                    'bookings.timing_flexible',
                    'bookings.special_handling',
                    'bookings.dangerous_goods',
                    'bookings.fragile_items',
                    'bookings.insurance_required',
                    'bookings.tracking_required',
                    'bookings.status',
                    'bookings.created_at',
                    'organizations.name as shipper_organization_name'
                ])
                    .where('bookings.status', 'in', ['active', 'in_bidding'])
            } else {
                // Shippers can see their own bookings with all details
                query = query.selectAll('bookings')
                    .select(['goods_types.name as goods_type_name'])
                    .where('bookings.shipper_org_id', '=', organizationId)
            }

            const booking = /** @type {Booking | undefined} */ (await query.executeTakeFirst())

            if (!booking) {
                return reply.code(404).send({ error: 'Booking not found' })
            }

            // Parse JSON fields
            if (booking.non_standard_pallets) {
                booking.non_standard_pallets = JSON.parse(booking.non_standard_pallets)
            }

            return reply.send(booking)
        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Failed to fetch booking' })
        }
    })

    // Create new booking (shippers only)
    /**
     * @typedef {Object} BookingPallet
     * @property {number} length
     * @property {number} width
     * @property {number} height
     * @property {number} weight
     * @property {string} [notes]
     *
     * @typedef {Object} BookingCreateBody
     * @property {string} origin_name
     * @property {string} origin_street_address
     * @property {string} [origin_building]
     * @property {string} origin_suburb
     * @property {string} origin_postcode
     * @property {string} origin_state
     * @property {string} destination_name
     * @property {string} destination_street_address
     * @property {string} [destination_building]
     * @property {string} destination_suburb
     * @property {string} destination_postcode
     * @property {string} destination_state
     * @property {BookingPallet[]} pallets
     * @property {number} [budget_minimum]
     * @property {number} [budget_maximum]
     * @property {string} [description]
     * @property {number} [goods_type_id]
     * @property {string} [collection_date_minimum]
     * @property {string} collection_date_requested
     * @property {string} [collection_date_maximum]
     * @property {string} [delivery_date_minimum]
     * @property {string} delivery_date_requested
     * @property {string} [delivery_date_maximum]
     * @property {string} [special_requirements]
     * @property {boolean} [requires_tailgate]
     * @property {boolean} [requires_crane]
     * @property {boolean} [requires_forklift]
     *
     * @typedef {Object} BookingInsert
     * @property {number} shipper_user_id
     * @property {number} shipper_org_id
     * @property {string} status
     * @property {string} [origin_name]
     * @property {string} [origin_street_address]
     * @property {string} [origin_building]
     * @property {string} [origin_suburb]
     * @property {string} [origin_postcode]
     * @property {string} [origin_state]
     * @property {string} [destination_name]
     * @property {string} [destination_street_address]
     * @property {string} [destination_building]
     * @property {string} [destination_suburb]
     * @property {string} [destination_postcode]
     * @property {string} [destination_state]
     * @property {string} pallets
     * @property {number} [budget_minimum]
     * @property {number} [budget_maximum]
     * @property {string} [description]
     * @property {number} [goods_type_id]
     * @property {string} [collection_date_minimum]
     * @property {string} [collection_date_requested]
     * @property {string} [collection_date_maximum]
     * @property {string} [delivery_date_minimum]
     * @property {string} [delivery_date_requested]
     * @property {string} [delivery_date_maximum]
     * @property {string} [special_requirements]
     * @property {boolean} [requires_tailgate]
     * @property {boolean} [requires_crane]
     * @property {boolean} [requires_forklift]
     */

    fastify.post('/bookings', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                required: [
                    'origin_name', 'origin_street_address', 'origin_suburb', 'origin_postcode', 'origin_state',
                    'destination_name', 'destination_street_address', 'destination_suburb', 'destination_postcode', 'destination_state',
                    'pallets', 'collection_date_requested', 'delivery_date_requested'
                ],
                properties: {
                    origin_name: { type: 'string' },
                    origin_street_address: { type: 'string' },
                    origin_building: { type: 'string' },
                    origin_suburb: { type: 'string' },
                    origin_postcode: { type: 'string' },
                    origin_state: { type: 'string' },
                    destination_name: { type: 'string' },
                    destination_street_address: { type: 'string' },
                    destination_building: { type: 'string' },
                    destination_suburb: { type: 'string' },
                    destination_postcode: { type: 'string' },
                    destination_state: { type: 'string' },
                    pallets: { type: 'array' },
                    budget_minimum: { type: 'number' },
                    budget_maximum: { type: 'number' },
                    description: { type: 'string' },
                    goods_type_id: { type: 'number' },
                    collection_date_minimum: { type: 'string', format: 'date' },
                    collection_date_requested: { type: 'string', format: 'date' },
                    collection_date_maximum: { type: 'string', format: 'date' },
                    delivery_date_minimum: { type: 'string', format: 'date' },
                    delivery_date_requested: { type: 'string', format: 'date' },
                    delivery_date_maximum: { type: 'string', format: 'date' },
                    special_requirements: { type: 'string' },
                    requires_tailgate: { type: 'boolean' },
                    requires_crane: { type: 'boolean' },
                    requires_forklift: { type: 'boolean' }
                }
            }
        }
    },
    /**
     * @param {{ body: BookingCreateBody, user: RequestUser }} request
     * @param {any} reply
     */
    async (request, reply) => {
        try {
            const { userId, organizationId, role } = request.user

            // Only shippers can create bookings
            if (role !== 'shipper' && role !== 'admin') {
                return reply.status(403).send({ error: 'Only shippers can create bookings' })
            }

            /** @type {BookingInsert} */
            const bookingData = {
                shipper_user_id: userId,
                shipper_org_id: organizationId,
                ...request.body,
                pallets: JSON.stringify(request.body.pallets),
                status: 'draft'
            }

            const [booking] = /** @type {{ id: number; status: string; created_at: string }[]} */ (await fastify.db
                .insertInto('bookings')
                .values(bookingData)
                .returning([
                    'id', 'status', 'created_at'
                ])
                .execute())

            return reply.status(201).send({ booking })

        } catch (error) {
            fastify.log.error('Error creating booking:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Update booking
    /**
     * @typedef {Object} BookingUpdateBody
     * @property {string} [origin_name]
     * @property {string} [origin_street_address]
     * @property {string} [origin_building]
     * @property {string} [origin_suburb]
     * @property {string} [origin_postcode]
     * @property {string} [origin_state]
     * @property {string} [destination_name]
     * @property {string} [destination_street_address]
     * @property {string} [destination_building]
     * @property {string} [destination_suburb]
     * @property {string} [destination_postcode]
     * @property {string} [destination_state]
     * @property {Array<any>|string} [pallets]
     * @property {number} [budget_minimum]
     * @property {number} [budget_maximum]
     * @property {string} [description]
     * @property {number} [goods_type_id]
     * @property {string} [collection_date_minimum]
     * @property {string} [collection_date_requested]
     * @property {string} [collection_date_maximum]
     * @property {string} [delivery_date_minimum]
     * @property {string} [delivery_date_requested]
     * @property {string} [delivery_date_maximum]
     * @property {string} [special_requirements]
     * @property {boolean} [requires_tailgate]
     * @property {boolean} [requires_crane]
     * @property {boolean} [requires_forklift]
     *
     * @typedef {Object} ExistingBookingRecord
     * @property {number} id
     * @property {number} shipper_user_id
     * @property {number} shipper_org_id
     * @property {string} status
     *
     * @typedef {Object} UpdatedBookingResult
     * @property {number} id
     * @property {string} status
     * @property {string} updated_at
     */

    fastify.put('/bookings/:id', {
        preHandler: [fastify.authenticate]
    }, 
    /**
     * @param {{ params: { id: number | string }, body: BookingUpdateBody, user: RequestUser }} request
     * @param {any} reply
     */
    async (request, reply) => {
        try {
            const { id } = request.params
            const { userId, organizationId } = request.user

            // Ensure user owns the booking
            const existingBooking = /** @type {ExistingBookingRecord | undefined} */ (await fastify.db
                .selectFrom('bookings')
                .select(['id', 'shipper_user_id', 'shipper_org_id', 'status'])
                .where('id', '=', id)
                .where('shipper_org_id', '=', organizationId)
                .executeTakeFirst())

            if (!existingBooking) {
                return reply.status(404).send({ error: 'Booking not found' })
            }

            if (existingBooking.status !== 'draft') {
                return reply.status(400).send({ error: 'Cannot modify booking after it has been published' })
            }

            /** @type {BookingUpdateBody & Record<string, any>} */
            const updateData = { ...request.body }
            if (updateData.pallets) {
                updateData.pallets = JSON.stringify(updateData.pallets)
            }

            const [updatedBooking] = /** @type {UpdatedBookingResult[]} */ (await fastify.db
                .updateTable('bookings')
                .set({
                    ...updateData,
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .returning(['id', 'status', 'updated_at'])
                .execute())

            return reply.send({ booking: updatedBooking })

        } catch (error) {
            fastify.log.error('Error updating booking:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Publish booking (make it available for carriers to bid on)
    /**
     * @typedef {Object} PublishBookingParams
     * @property {number|string} id
     *
     * @typedef {Object} PublishedBookingRecord
     * @property {number} id
     * @property {string} status
     * @property {string} published_at
     */

    fastify.post('/bookings/:id/publish', {
        preHandler: [fastify.authenticate]
    },
    /**
     * @param {{ params: PublishBookingParams, user: RequestUser }} request
     * @param {any} reply
     */
    async (request, reply) => {
        try {
            const { id } = request.params
            const { organizationId } = request.user

            const [updatedBooking] = /** @type {PublishedBookingRecord[] } */ (await fastify.db
                .updateTable('bookings')
                .set({
                    status: 'open',
                    published_at: new Date(),
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .where('shipper_org_id', '=', organizationId)
                .where('status', '=', 'draft')
                .returning(['id', 'status', 'published_at'])
                .execute())

            if (!updatedBooking) {
                return reply.status(404).send({ error: 'Booking not found or cannot be published' })
            }

            return reply.send({ booking: updatedBooking })

        } catch (error) {
            fastify.log.error('Error publishing booking:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })
}
