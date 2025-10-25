import { NextResponse } from 'next/server'

// Use internal Docker service name for server-side API calls
const API_BASE = process.env.INTERNAL_API_URL || 'http://api:3001'

export async function POST(request) {
    try {
        const body = await request.json()

        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Login proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
