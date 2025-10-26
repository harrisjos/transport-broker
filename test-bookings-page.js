// Test the bookings page with authentication
const test = async () => {
    console.log('=== Testing Bookings Page Access ===');

    // 1. First, let's see what the page actually returns
    console.log('\n1. Testing unauthenticated access to /bookings page...');
    try {
        const pageResponse = await fetch('http://localhost:3000/bookings');
        console.log(`   Page status: ${pageResponse.status}`);
        const pageText = await pageResponse.text();

        if (pageText.includes('404')) {
            console.log('   ❌ Page shows 404 error');
        } else if (pageText.includes('Loading...')) {
            console.log('   ⏳ Page shows loading state');
        } else if (pageText.includes('My Bookings')) {
            console.log('   ✅ Page shows bookings content');
        } else {
            console.log('   ❓ Page shows unexpected content');
        }
    } catch (error) {
        console.error('   Error accessing page:', error.message);
    }

    // 2. Test with authentication
    console.log('\n2. Testing authenticated access...');
    try {
        // Login first
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john.customer@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            console.log('   ❌ Login failed');
            return;
        }

        const loginData = await loginResponse.json();
        console.log('   ✅ Login successful');

        // Test API endpoint directly
        const apiResponse = await fetch('http://localhost:3001/api/bookings', {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });

        console.log(`   API status: ${apiResponse.status}`);

        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log(`   ✅ API returned ${apiData.bookings?.length || 0} bookings`);
        } else {
            console.log('   ❌ API request failed');
        }

    } catch (error) {
        console.error('   Error in authenticated test:', error.message);
    }

    console.log('\n=== Test Complete ===');
};

test().catch(console.error);