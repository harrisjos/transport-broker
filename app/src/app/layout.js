// @ts-nocheck
/**
 * M8Freight Root Layout - Dark Mode, Mobile-First
 */
'use client'

// @ts-ignore: allow importing CSS without type declarations
import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from '../lib/auth-jwt'
import Navigation from '../components/Navigation'
// @ts-ignore: allow importing CSS without type declarations
import './globals.css'
import BRANDING from '../config/branding'

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
    return (
        <html lang="en" data-bs-theme="dark">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{`${BRANDING.appName} - ${BRANDING.tagline}`}</title>
                <meta name="description" content={`${BRANDING.appName} - ${BRANDING.tagline}`} />
                <link rel="icon" href={BRANDING.assets.favicon} />
                <link rel="apple-touch-icon" href={BRANDING.assets.appleTouchIcon} />
                <meta name="theme-color" content={BRANDING.colors.primary} />

                {/* PWA Meta Tags for Mobile */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content={BRANDING.appName} />

                {/* Open Graph */}
                <meta property="og:title" content={BRANDING.appName} />
                <meta property="og:description" content={BRANDING.tagline} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={BRANDING.assets.logo} />
            </head>
            <body className="bg-dark text-light">
                <AuthProvider>
                    <Navigation />
                    <main className="container-fluid" style={{ paddingTop: `calc(${BRANDING.components.navbar.height} + 1rem)`, paddingBottom: '1rem' }}>
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
