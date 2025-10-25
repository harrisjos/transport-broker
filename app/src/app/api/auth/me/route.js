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

        const response = await fetch(`${API_BASE}/api/auth/me`, {
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
        console.error('Me proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
