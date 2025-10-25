import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const API_BASE = process.env.INTERNAL_API_URL || 'http://api:3001'

export async function PUT(request) {
    try {
        // Get JWT token from cookies
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Get request body
        const profileData = await request.json()

        // Forward to backend API
        const response = await fetch(`${API_BASE}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Profile update proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
