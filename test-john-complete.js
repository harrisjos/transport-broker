// Test John Customer's authentication and API access
const test = async () => {
    console.log('=== Testing John Customer Authentication & API Access ===');

    try {
        // 1. Test login
        console.log('\n1. Testing login...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john.customer@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Login failed:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`   User: ${loginData.user.name} (${loginData.user.email})`);

        // 2. Test API endpoints with token
        const token = loginData.token;

        console.log('\n2. Testing API endpoints...');

        // Test dashboard bookings (my_jobs=true)
        const dashboardResponse = await fetch('http://localhost:3001/api/bookings?my_jobs=true', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`   Dashboard API (/api/bookings?my_jobs=true): ${dashboardResponse.status}`);
        if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log(`   📊 Dashboard shows ${dashboardData.bookings?.length || 0} bookings`);
        } else {
            console.log(`   ❌ Dashboard API error: ${await dashboardResponse.text()}`);
        }

        // Test all bookings
        const allBookingsResponse = await fetch('http://localhost:3001/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`   All Bookings API (/api/bookings): ${allBookingsResponse.status}`);
        if (allBookingsResponse.ok) {
            const allBookingsData = await allBookingsResponse.json();
            console.log(`   📋 All bookings shows ${allBookingsData.bookings?.length || 0} bookings`);
        } else {
            console.log(`   ❌ All bookings API error: ${await allBookingsResponse.text()}`);
        }

        // 3. Test frontend pages
        console.log('\n3. Testing frontend pages...');

        const dashboardPageResponse = await fetch('http://localhost:3000/dashboard');
        console.log(`   Dashboard page: ${dashboardPageResponse.status === 200 ? '✅' : '❌'} (${dashboardPageResponse.status})`);

        const bookingsPageResponse = await fetch('http://localhost:3000/bookings');
        console.log(`   Bookings page: ${bookingsPageResponse.status === 200 ? '✅' : '❌'} (${bookingsPageResponse.status})`);

        const profilePageResponse = await fetch('http://localhost:3000/profile');
        console.log(`   Profile page: ${profilePageResponse.status === 200 ? '✅' : '❌'} (${profilePageResponse.status})`);

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

test().catch(console.error);