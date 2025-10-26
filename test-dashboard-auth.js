const axios = require('axios');

async function testDashboardAuth() {
    try {
        console.log('=== Testing Dashboard Authentication Fix ===\n');

        // Step 1: Login as John Customer
        console.log('1. Logging in as John Customer...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'john.customer@example.com',
            password: 'password123'
        });

        if (loginResponse.status !== 200) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const { token, user } = loginResponse.data;
        console.log(`✅ Login successful`);
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Organization Type: ${user.organizationType}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);

        // Step 2: Test the API endpoint that dashboard uses with auth header
        console.log('\n2. Testing API with authentication...');
        const apiResponse = await axios.get('http://localhost:3001/api/bookings?my_jobs=true&limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (apiResponse.status !== 200) {
            throw new Error(`API request failed: ${apiResponse.status}`);
        }

        const bookings = apiResponse.data.bookings || [];
        console.log(`✅ API request successful`);
        console.log(`   Found ${bookings.length} bookings`);

        if (bookings.length > 0) {
            console.log('   Recent bookings:');
            bookings.forEach((booking, index) => {
                console.log(`     ${index + 1}. ${booking.pickup_city} → ${booking.delivery_city} (${booking.status})`);
            });
        }

        // Step 3: Test the frontend proxy API that dashboard calls
        console.log('\n3. Testing frontend proxy API...');
        const proxyResponse = await axios.get('http://localhost:3000/api/bookings?my_jobs=true&limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (proxyResponse.status !== 200) {
            throw new Error(`Proxy API request failed: ${proxyResponse.status}`);
        }

        const proxyBookings = proxyResponse.data.bookings || [];
        console.log(`✅ Proxy API request successful`);
        console.log(`   Found ${proxyBookings.length} bookings through proxy`);

        // Step 4: Compare results
        console.log('\n4. Comparing results...');
        if (bookings.length === proxyBookings.length) {
            console.log(`✅ Both APIs return same number of bookings (${bookings.length})`);
        } else {
            console.log(`❌ Mismatch: Direct API (${bookings.length}) vs Proxy API (${proxyBookings.length})`);
        }

        console.log('\n=== Dashboard Authentication Test Complete ===');
        console.log('✅ The makeAuthenticatedRequest fix should now work properly!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

testDashboardAuth();