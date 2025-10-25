// @ts-check
/**
 * JSON Schema definitions for job-related API validation
 */

export const jobCreateSchema = {
    type: 'object',
    required: [
        'title',
        'description',
        'pickup_address',
        'delivery_address',
        'pickup_date',
        'delivery_date',
        'weight_kg'
    ],
    properties: {
        title: {
            type: 'string',
            minLength: 3,
            maxLength: 200
        },
        description: {
            type: 'string',
            minLength: 10,
            maxLength: 2000
        },
        pickup_address: {
            type: 'string',
            minLength: 5,
            maxLength: 500
        },
        delivery_address: {
            type: 'string',
            minLength: 5,
            maxLength: 500
        },
        pickup_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90
        },
        pickup_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180
        },
        delivery_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90
        },
        delivery_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180
        },
        pickup_date: {
            type: 'string',
            format: 'date-time'
        },
        delivery_date: {
            type: 'string',
            format: 'date-time'
        },
        weight_kg: {
            type: 'number',
            minimum: 0.1,
            maximum: 50000
        },
        pallet_count: {
            type: 'integer',
            minimum: 0,
            maximum: 100
        },
        estimated_price: {
            type: 'number',
            minimum: 0
        }
    },
    additionalProperties: false
}

export const jobUpdateSchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            minLength: 3,
            maxLength: 200
        },
        description: {
            type: 'string',
            minLength: 10,
            maxLength: 2000
        },
        pickup_address: {
            type: 'string',
            minLength: 5,
            maxLength: 500
        },
        delivery_address: {
            type: 'string',
            minLength: 5,
            maxLength: 500
        },
        pickup_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90
        },
        pickup_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180
        },
        delivery_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90
        },
        delivery_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180
        },
        pickup_date: {
            type: 'string',
            format: 'date-time'
        },
        delivery_date: {
            type: 'string',
            format: 'date-time'
        },
        weight_kg: {
            type: 'number',
            minimum: 0.1,
            maximum: 50000
        },
        pallet_count: {
            type: 'integer',
            minimum: 0,
            maximum: 100
        },
        estimated_price: {
            type: 'number',
            minimum: 0
        },
        status: {
            type: 'string',
            enum: ['open', 'accepted', 'in_transit', 'delivered', 'completed', 'cancelled']
        }
    },
    additionalProperties: false,
    minProperties: 1
}

export const bidCreateSchema = {
    type: 'object',
    required: ['price'],
    properties: {
        price: {
            type: 'number',
            minimum: 0.01
        },
        message: {
            type: 'string',
            maxLength: 1000
        }
    },
    additionalProperties: false
}