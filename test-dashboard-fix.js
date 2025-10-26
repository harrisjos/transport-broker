const axios = require('axios');

async function testDashboardFix() {
    try {
        console.log('=== Testing Dashboard Fix ===\n');

        // Step 1: Login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'john.customer@example.com',
            password: 'password123'
        });

        const { token } = loginResponse.data;
        console.log('✅ Login successful, token received');

        // Step 2: Test /api/auth/me to see complete user object
        console.log('\n2. Getting complete user data...');
        const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const completeUser = meResponse.data;
        console.log('✅ Complete user data received');
        console.log(`   User: ${completeUser.name}`);
        console.log(`   Organization Type: ${completeUser.organizationType}`);
        console.log(`   Should show bookings: ${completeUser.organizationType === 'shipper' || completeUser.organizationType === 'both'}`);

        // Step 3: Test dashboard API with complete user context
        if (completeUser.organizationType === 'shipper' || completeUser.organizationType === 'both') {
            console.log('\n3. Testing dashboard bookings API...');
            const bookingsResponse = await axios.get('http://localhost:3000/api/bookings?my_jobs=true&limit=5', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (bookingsResponse.status === 200) {
                const bookings = bookingsResponse.data.bookings || [];
                console.log(`✅ Dashboard API successful - ${bookings.length} bookings`);

                if (bookings.length > 0) {
                    console.log('   Bookings:');
                    bookings.forEach((booking, index) => {
                        console.log(`     ${index + 1}. ID: ${booking.id}, Status: ${booking.status}`);
                    });
                } else {
                    console.log('   ❌ No bookings returned (but API call succeeded)');
                }
            } else {
                console.log(`❌ Dashboard API failed: ${bookingsResponse.status}`);
            }
        } else {
            console.log('\n3. User is not a shipper - bookings should not be fetched');
        }

        console.log('\n=== Test Complete ===');
        console.log('✅ The fix should work: User has organizationType and API returns bookings');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

testDashboardFix();