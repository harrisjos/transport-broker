import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            )
        }

        // Forward to API server
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001'

        console.log('Reset password proxy to:', apiUrl)

        const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Reset password API error:', data)
            return NextResponse.json(
                { message: data.message || 'Reset password failed' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Reset password proxy error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}