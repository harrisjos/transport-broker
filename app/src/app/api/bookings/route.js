import { NextResponse } from 'next/server'

// Use internal Docker service name for server-side API calls
const API_BASE = process.env.INTERNAL_API_URL || 'http://api:3001'

export async function GET(request) {
    try {
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        // Get query parameters from the request URL
        const url = new URL(request.url)
        const searchParams = url.searchParams
        const queryString = searchParams.toString()

        const response = await fetch(`${API_BASE}/api/bookings${queryString ? `?${queryString}` : ''}`, {
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
        console.error('Bookings GET proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const body = await request.json()

        const response = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
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

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Bookings POST proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
