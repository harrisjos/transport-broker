const axios = require('axios');

async function debugBackendAuth() {
    try {
        console.log('=== Testing Backend Auth Endpoints Directly ===\n');

        // Step 1: Backend login
        console.log('1. Testing backend login...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'john.customer@example.com',
            password: 'password123'
        });

        console.log(`✅ Backend login successful`);
        console.log(`   Login response user:`, loginResponse.data.user);

        const { token, user } = loginResponse.data;

        // Step 2: Backend me endpoint
        console.log('\n2. Testing backend /auth/me...');
        const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✅ Backend me successful`);
        console.log(`   Me response user:`, meResponse.data);

        // Step 3: Compare the two
        console.log('\n3. Comparing responses...');
        console.log(`   Login organizationType: ${loginResponse.data.user.organizationType}`);
        console.log(`   Me organizationType: ${meResponse.data.organizationType}`);

        if (loginResponse.data.user.organizationType !== meResponse.data.organizationType) {
            console.log(`   ❌ MISMATCH: Login and Me endpoints return different organizationType`);
        } else {
            console.log(`   ✅ MATCH: Both endpoints return same organizationType`);
        }

    } catch (error) {
        console.error('❌ Backend auth test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

debugBackendAuth();