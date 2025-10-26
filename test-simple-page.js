// Test the simple bookings page
const test = async () => {
    try {
        const response = await fetch('http://localhost:3000/bookings');
        const html = await response.text();

        console.log('Status:', response.status);

        if (html.includes('Test Bookings Page')) {
            console.log('✅ Simple page is working');
        } else if (html.includes('404')) {
            console.log('❌ Still getting 404');
        } else {
            console.log('❓ Unknown content');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

test().catch(console.error);