// Debug what properties the user object has in the frontend
const test = async () => {
    console.log('=== Testing Frontend User Object ===');

    try {
        // Login to get a token
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john.customer@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // Test the /me endpoint that the frontend uses
        const meResponse = await fetch('http://localhost:3001/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (meResponse.ok) {
            const userData = await meResponse.json();
            console.log('User object from /api/auth/me:');
            console.log(JSON.stringify(userData, null, 2));
        } else {
            console.log('❌ /me endpoint failed:', await meResponse.text());
        }

        // Also decode the JWT to see what's in it
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        console.log('\nJWT payload:');
        console.log(JSON.stringify(decoded, null, 2));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

test().catch(console.error);