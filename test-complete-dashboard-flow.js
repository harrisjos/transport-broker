const axios = require('axios');

async function testCompleteDashboardFlow() {
    try {
        console.log('=== Testing Complete Dashboard Flow ===\n');

        // Step 1: Complete login flow
        console.log('1. Performing complete login flow...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'john.customer@example.com',
            password: 'password123'
        });

        const { token, user: loginUser } = loginResponse.data;
        console.log('✅ Login response received');
        console.log(`   Initial user: ${loginUser?.name}`);
        console.log(`   Initial organizationType: ${loginUser?.organizationType}`);

        // Step 2: Simulate what the auth context does - call getCurrentUser
        console.log('\n2. Simulating auth context getCurrentUser call...');
        const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const currentUser = meResponse.data;
        console.log('✅ getCurrentUser completed');
        console.log(`   Current user: ${currentUser.name}`);
        console.log(`   Current organizationType: ${currentUser.organizationType}`);

        // Step 3: Simulate dashboard condition check
        console.log('\n3. Checking dashboard conditions...');
        const isShipper = currentUser.organizationType === 'shipper';
        const isBoth = currentUser.organizationType === 'both';
        const shouldFetchBookings = isShipper || isBoth;

        console.log(`   Is shipper: ${isShipper}`);
        console.log(`   Is both: ${isBoth}`);
        console.log(`   Should fetch bookings: ${shouldFetchBookings}`);

        // Step 4: Simulate dashboard fetchDashboardData call
        if (shouldFetchBookings) {
            console.log('\n4. Simulating dashboard API call...');
            const dashboardResponse = await axios.get('http://localhost:3000/api/bookings?my_jobs=true&limit=5', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (dashboardResponse.status === 200) {
                const bookings = dashboardResponse.data.bookings || [];
                console.log(`✅ Dashboard bookings fetched: ${bookings.length} bookings`);

                if (bookings.length > 0) {
                    console.log('   Bookings summary:');
                    bookings.forEach((booking, index) => {
                        console.log(`     ${index + 1}. ID: ${booking.id}, Status: ${booking.status}, Created: ${booking.created_at}`);
                    });

                    console.log('\n✅ SUCCESS: Dashboard should display these bookings!');
                } else {
                    console.log('   ❌ ISSUE: API returned no bookings');
                }
            } else {
                console.log(`❌ Dashboard API failed: ${dashboardResponse.status}`);
            }
        } else {
            console.log('\n4. Dashboard conditions not met - no bookings will be fetched');
            console.log('   ❌ ISSUE: User organizationType is not shipper or both');
        }

        // Step 5: Test dashboard page response
        console.log('\n5. Testing dashboard page accessibility...');
        const dashboardPageResponse = await axios.get('http://localhost:3000/dashboard');
        console.log(`   Dashboard page status: ${dashboardPageResponse.status}`);

        console.log('\n=== Flow Test Complete ===');

    } catch (error) {
        console.error('❌ Flow test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            if (error.response.data) {
                console.error('   Response data:', typeof error.response.data === 'string'
                    ? error.response.data.substring(0, 200) + '...'
                    : error.response.data);
            }
        }
    }
}

testCompleteDashboardFlow();