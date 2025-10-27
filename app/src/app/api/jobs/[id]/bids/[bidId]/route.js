import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../../lib/jwt'
import { query } from '../../../../../lib/db'

/**
 * PATCH /api/jobs/[id]/bids/[bidId] - Accept or reject a bid
 */
export async function PATCH(request, { params }) {
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
        const { action } = body

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "accept" or "reject"' },
                { status: 400 }
            )
        }

        const resolvedParams = await params
        const jobId = resolvedParams.id
        const bidId = resolvedParams.bidId

        // Verify the job exists and belongs to the user
        const jobResult = await query(
            'SELECT id, user_id, status FROM bookings WHERE id = $1',
            [jobId]
        )

        if (jobResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        const job = jobResult.rows[0]
        if (job.user_id !== decoded.userId) {
            return NextResponse.json(
                { error: 'Access denied - you can only manage bids on your own jobs' },
                { status: 403 }
            )
        }

        // Verify the bid exists and belongs to this job
        const bidResult = await query(
            'SELECT id, booking_id, carrier_org_id, status, total_price FROM bids WHERE id = $1 AND booking_id = $2',
            [bidId, jobId]
        )

        if (bidResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Bid not found' },
                { status: 404 }
            )
        }

        const bid = bidResult.rows[0]
        if (bid.status !== 'pending') {
            return NextResponse.json(
                { error: 'Bid is no longer pending and cannot be modified' },
                { status: 400 }
            )
        }

        // Start a transaction
        await query('BEGIN')

        try {
            if (action === 'accept') {
                // Accept the bid
                await query(
                    'UPDATE bids SET status = $1, responded_at = NOW(), updated_at = NOW() WHERE id = $2',
                    ['accepted', bidId]
                )

                // Reject all other pending bids for this job
                await query(
                    'UPDATE bids SET status = $1, responded_at = NOW(), updated_at = NOW() WHERE booking_id = $2 AND id != $3 AND status = $4',
                    ['rejected', jobId, bidId, 'pending']
                )

                // Update job status to assigned and link the selected bid
                await query(
                    'UPDATE bookings SET status = $1, selected_bid_id = $2, updated_at = NOW() WHERE id = $3',
                    ['assigned', bidId, jobId]
                )

            } else if (action === 'reject') {
                // Reject the bid
                await query(
                    'UPDATE bids SET status = $1, responded_at = NOW(), updated_at = NOW() WHERE id = $2',
                    ['rejected', bidId]
                )

                // Check if there are any remaining pending bids
                const remainingBidsResult = await query(
                    'SELECT COUNT(*) as count FROM bids WHERE booking_id = $1 AND status = $2',
                    [jobId, 'pending']
                )

                const remainingBids = parseInt(remainingBidsResult.rows[0].count)

                // If no pending bids remain, set job status back to active
                if (remainingBids === 0) {
                    await query(
                        'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
                        ['active', jobId]
                    )
                }
            }

            // Commit the transaction
            await query('COMMIT')

            // Get updated bid information
            const updatedBidResult = await query(`
                SELECT 
                    b.id,
                    b.booking_id,
                    b.carrier_org_id,
                    o.name as organization_name,
                    b.total_price,
                    b.status,
                    b.responded_at,
                    b.updated_at
                FROM bids b
                JOIN organizations o ON b.carrier_org_id = o.id
                WHERE b.id = $1
            `, [bidId])

            const updatedBid = updatedBidResult.rows[0]

            return NextResponse.json({
                success: true,
                message: `Bid ${action}ed successfully`,
                bid: {
                    ...updatedBid,
                    total_price: parseFloat(updatedBid.total_price)
                }
            })

        } catch (transactionError) {
            // Rollback the transaction
            await query('ROLLBACK')
            throw transactionError
        }

    } catch (error) {
        console.error('Error updating bid:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}