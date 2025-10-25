import { NextResponse } from 'next/server'

// Use internal Docker service name for server-side API calls
const API_BASE = process.env.INTERNAL_API_URL || 'http://api:3001'

export async function GET(request) {
    try {
        const response = await fetch(`${API_BASE}/api/goods-types`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Goods types proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
