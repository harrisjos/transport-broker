// @ts-check
/**
 * Root layout component with Bootstrap and Firebase Auth setup
 */
'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from '../lib/auth'
import Navigation from '../components/Navigation'
import './globals.css'

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Transport Broker - Connect Carriers & Customers</title>
                <meta name="description" content="Full-service transport and logistics marketplace connecting customers with reliable carriers" />
            </head>
            <body>
                <AuthProvider>
                    <Navigation />
                    <main className="container-fluid py-3">
                        {children}
                    </main>
                    {/* Bootstrap JS */}
                    <script
                        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
                        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
                        crossOrigin="anonymous"
                        async
                    />
                </AuthProvider>
            </body>
        </html>
    )
}