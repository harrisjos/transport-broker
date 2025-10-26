import { NextResponse } from 'next/server'

// Use internal Docker service name for server-side API calls
const API_BASE = process.env.INTERNAL_API_URL || 'http://api:3001'

export async function GET(request, { params }) {
    try {
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const { uuid } = params

        // Validate UUID format (basic check)
        if (!uuid || typeof uuid !== 'string' || uuid.length < 10) {
            return NextResponse.json(
                { error: 'Invalid UUID format' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_BASE}/api/bookings/uuid/${uuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Booking UUID GET proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const { uuid } = params
        const body = await request.json()

        // Validate UUID format (basic check)
        if (!uuid || typeof uuid !== 'string' || uuid.length < 10) {
            return NextResponse.json(
                { error: 'Invalid UUID format' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_BASE}/api/bookings/uuid/${uuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Booking UUID PUT proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const { uuid } = params

        // Validate UUID format (basic check)
        if (!uuid || typeof uuid !== 'string' || uuid.length < 10) {
            return NextResponse.json(
                { error: 'Invalid UUID format' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_BASE}/api/bookings/uuid/${uuid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Booking UUID DELETE proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}