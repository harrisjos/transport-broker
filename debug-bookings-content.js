// Debug what the bookings page is actually returning
const test = async () => {
    console.log('=== Debugging Bookings Page Content ===');

    try {
        const response = await fetch('http://localhost:3000/bookings');
        const html = await response.text();

        console.log('Page Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        // Check for specific content
        if (html.includes('404')) {
            console.log('✅ Contains 404 text');
        }

        if (html.includes('This page could not be found')) {
            console.log('✅ Contains "This page could not be found"');
        }

        if (html.includes('My Bookings')) {
            console.log('✅ Contains "My Bookings"');
        }

        if (html.includes('BookingsPage')) {
            console.log('✅ Contains BookingsPage component');
        }

        // Look for the specific error pattern from the attachment
        if (html.includes('next-error-h1')) {
            console.log('✅ Found Next.js error page structure');
        }

        // Extract a relevant snippet
        const snippetStart = html.indexOf('404') - 50;
        const snippetEnd = html.indexOf('404') + 100;
        if (snippetStart > 0) {
            const snippet = html.substring(Math.max(0, snippetStart), snippetEnd);
            console.log('\nContent around 404:');
            console.log(snippet);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

test().catch(console.error);