/**
 * Test the bookings API for John Customer
 */

async function testBookingsForJohn() {
    console.log('🔍 Testing bookings access for John Customer...\n');

    try {
        // Step 1: Login as John
        console.log('1. Logging in as John Customer...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john.customer@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log('User:', loginData.user?.name, '(' + loginData.user?.email + ')');

        // Step 2: Test bookings API with my_jobs=true
        console.log('\n2. Fetching bookings with my_jobs=true...');
        const bookingsResponse = await fetch('http://localhost:3001/api/bookings?my_jobs=true&limit=10', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!bookingsResponse.ok) {
            console.error('❌ Bookings API failed:', bookingsResponse.status);
            const errorText = await bookingsResponse.text();
            console.error('Error:', errorText);
            return;
        }

        const bookingsData = await bookingsResponse.json();
        console.log('✅ Bookings API successful');
        console.log('Bookings found:', bookingsData.bookings?.length || 0);

        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
            console.log('\n📋 Bookings:');
            bookingsData.bookings.forEach((booking, index) => {
                console.log(`  ${index + 1}. Booking ${booking.id}: ${booking.description?.substring(0, 60)}...`);
                console.log(`     Status: ${booking.status}`);
            });
        } else {
            console.log('❌ No bookings found - this indicates the issue still exists');
        }

        // Step 3: Test regular bookings API (without my_jobs)
        console.log('\n3. Fetching bookings without my_jobs parameter...');
        const allBookingsResponse = await fetch('http://localhost:3001/api/bookings?limit=10', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (allBookingsResponse.ok) {
            const allBookingsData = await allBookingsResponse.json();
            console.log('All bookings found:', allBookingsData.bookings?.length || 0);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBookingsForJohn();