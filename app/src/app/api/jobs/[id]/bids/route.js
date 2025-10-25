import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/jwt'
import { query } from '../../../../lib/db'

/**
 * POST /api/jobs/[id]/bids - Create a new bid for a job
 */
export async function POST(request, { params }) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
            request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const decoded = verifyJWT(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const {
            amount,
            expiry_date,
            pickup_date,
            delivery_date,
            notes,
            terms_and_conditions
        } = body

        // Validation
        if (!amount || !expiry_date || !pickup_date || !delivery_date) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, expiry_date, pickup_date, delivery_date' },
                { status: 400 }
            )
        }

        const jobId = params.id

        // Verify the job exists and is available for bidding
        const jobResult = await query(
            'SELECT id, status FROM bookings WHERE id = $1',
            [jobId]
        )

        if (jobResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        const job = jobResult.rows[0]
        if (job.status !== 'active' && job.status !== 'in_bidding') {
            return NextResponse.json(
                { error: 'Job is not available for bidding' },
                { status: 400 }
            )
        }

        // Get user's organization
        const userResult = await query(
            'SELECT id, primary_organization_id FROM users WHERE id = $1',
            [decoded.userId]
        )

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const user = userResult.rows[0]

        // Verify user's organization is a carrier
        const orgResult = await query(
            'SELECT id, name, organization_type FROM organizations WHERE id = $1',
            [user.primary_organization_id]
        )

        if (orgResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User organization not found' },
                { status: 404 }
            )
        }

        const organization = orgResult.rows[0]
        if (organization.organization_type !== 'carrier' && organization.organization_type !== 'both') {
            return NextResponse.json(
                { error: 'Only carrier organizations can place bids' },
                { status: 403 }
            )
        }

        // Check if user has already placed a bid on this job
        const existingBidResult = await query(
            'SELECT id FROM bids WHERE booking_id = $1 AND carrier_org_id = $2',
            [jobId, user.primary_organization_id]
        )

        if (existingBidResult.rows.length > 0) {
            return NextResponse.json(
                { error: 'You have already placed a bid on this job' },
                { status: 400 }
            )
        }

        // Create the bid using the correct column names
        const bidResult = await query(`
            INSERT INTO bids (
                booking_id, 
                carrier_org_id, 
                carrier_user_id, 
                total_price, 
                valid_until, 
                proposed_collection_date, 
                proposed_delivery_date, 
                message, 
                terms_and_conditions,
                status,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW())
            RETURNING id, status, created_at
        `, [
            jobId,
            user.primary_organization_id,
            decoded.userId,
            amount,
            expiry_date,
            pickup_date,
            delivery_date,
            notes || null,
            terms_and_conditions || null
        ])

        const newBid = bidResult.rows[0]

        // Update job status to 'in_bidding' if it was 'active'
        if (job.status === 'active') {
            await query(
                'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
                ['in_bidding', jobId]
            )
        }

        return NextResponse.json({
            success: true,
            bid: {
                id: newBid.id,
                booking_id: parseInt(jobId),
                carrier_org_id: user.primary_organization_id,
                organization_name: organization.name,
                total_price: parseFloat(amount),
                valid_until: expiry_date,
                proposed_collection_date: pickup_date,
                proposed_delivery_date: delivery_date,
                message: notes,
                terms_and_conditions,
                status: newBid.status,
                created_at: newBid.created_at
            }
        })

    } catch (error) {
        console.error('Error creating bid:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/jobs/[id]/bids - Get all bids for a specific job
 */
export async function GET(request, { params }) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
            request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const decoded = verifyJWT(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        const jobId = params.id

        // Verify the job exists
        const jobResult = await query(
            'SELECT id, user_id FROM bookings WHERE id = $1',
            [jobId]
        )

        if (jobResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        const job = jobResult.rows[0]

        // Only job owner can view all bids
        if (job.user_id !== decoded.userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Get all bids for this job using correct column names
        const bidsResult = await query(`
            SELECT 
                b.id,
                b.booking_id,
                b.carrier_org_id,
                o.name as organization_name,
                b.total_price,
                b.valid_until,
                b.proposed_collection_date,
                b.proposed_delivery_date,
                b.message,
                b.terms_and_conditions,
                b.status,
                b.created_at,
                b.updated_at
            FROM bids b
            JOIN organizations o ON b.carrier_org_id = o.id
            WHERE b.booking_id = $1
            ORDER BY b.created_at ASC
        `, [jobId])

        return NextResponse.json({
            success: true,
            bids: bidsResult.rows.map(bid => ({
                ...bid,
                total_price: parseFloat(bid.total_price)
            }))
        })

    } catch (error) {
        console.error('Error fetching bids:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}