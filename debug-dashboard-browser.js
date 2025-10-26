const axios = require('axios');

async function debugDashboardBrowser() {
    try {
        console.log('=== Debugging Dashboard Browser Behavior ===\n');

        // Step 1: Login like the browser would
        console.log('1. Logging in through frontend...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'john.customer@example.com',
            password: 'password123'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (loginResponse.status !== 200) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const { token, user } = loginResponse.data;
        console.log(`✅ Frontend login successful`);
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Organization Type: ${user.organizationType}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'No token'}`);

        // Step 2: Test the exact dashboard request with token
        console.log('\n2. Testing dashboard API call with token...');
        const dashboardResponse = await axios.get('http://localhost:3000/api/bookings?my_jobs=true&limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (dashboardResponse.status !== 200) {
            throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
        }

        const dashboardData = dashboardResponse.data;
        console.log(`✅ Dashboard API successful`);
        console.log(`   Response structure:`, Object.keys(dashboardData));

        if (dashboardData.bookings) {
            console.log(`   Found ${dashboardData.bookings.length} bookings`);
            dashboardData.bookings.forEach((booking, index) => {
                console.log(`     ${index + 1}. ID: ${booking.id}, Status: ${booking.status}`);
                console.log(`        Route: ${booking.pickup_city || 'N/A'} → ${booking.delivery_city || 'N/A'}`);
                console.log(`        Created: ${booking.created_at || 'N/A'}`);
            });
        } else {
            console.log(`   ❌ No bookings array in response`);
            console.log(`   Response data:`, dashboardData);
        }

        // Step 3: Test without authentication to compare
        console.log('\n3. Testing same request WITHOUT authentication...');
        try {
            const noAuthResponse = await axios.get('http://localhost:3000/api/bookings?my_jobs=true&limit=5');
            console.log(`   No auth response status: ${noAuthResponse.status}`);
            console.log(`   No auth response:`, noAuthResponse.data);
        } catch (noAuthError) {
            console.log(`   ❌ No auth request failed: ${noAuthError.response?.status} ${noAuthError.response?.statusText}`);
            console.log(`   This is expected - API should require authentication`);
        }

        // Step 4: Check the user object structure for dashboard logic
        console.log('\n4. Checking user object for dashboard logic...');
        console.log(`   User organizationType: "${user.organizationType}"`);
        console.log(`   Is shipper: ${user.organizationType === 'shipper'}`);
        console.log(`   Is both: ${user.organizationType === 'both'}`);
        console.log(`   Dashboard should show bookings: ${user.organizationType === 'shipper' || user.organizationType === 'both'}`);

        console.log('\n=== Debug Complete ===');

        // Summary
        if (dashboardData.bookings && dashboardData.bookings.length > 0) {
            console.log('✅ SUMMARY: API is working correctly and returning bookings');
            console.log('   The issue might be in the frontend rendering logic');
        } else {
            console.log('❌ SUMMARY: API is not returning bookings');
            console.log('   The issue is in the API or authentication');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

debugDashboardBrowser();