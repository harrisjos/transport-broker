// @ts-nocheck
/**
 * Test login functionality with our simplified auth
 */

async function testLogin() {
    const loginData = {
        email: 'test3@example.com',
        password: 'password123'
    }

    try {
        console.log('Testing login with:', loginData.email)

        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Login successful!')
            console.log('User:', result.user)
            console.log('Token received:', result.token ? 'Yes' : 'No')

            // Test the /me endpoint
            if (result.token) {
                console.log('\nTesting /me endpoint...')
                const meResponse = await fetch('http://localhost:3001/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${result.token}`
                    }
                })

                if (meResponse.ok) {
                    const meResult = await meResponse.json()
                    console.log('✅ /me endpoint successful!')
                    console.log('User profile:', meResult.user)
                } else {
                    const error = await meResponse.json()
                    console.log('❌ /me endpoint failed:', error)
                }
            }
        } else {
            console.log('❌ Login failed:', result)
        }

    } catch (error) {
        console.error('❌ Login test error:', error)
    }
}

testLogin()