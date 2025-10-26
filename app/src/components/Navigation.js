// @ts-nocheck
/**
 * M8Freight Navigation Component - Dark Mode, Mobile-First
 */
'use client'

import Link from 'next/link'
import { useAuth } from '../lib/auth-jwt'
import BRANDING from '../config/branding'

export default function Navigation() {
    const { user, logout, loading } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top shadow-sm">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand d-flex align-items-center">
                    <img
                        src={BRANDING.assets.logo}
                        alt={`${BRANDING.appName} Logo`}
                        height={BRANDING.components.navbar.logoHeight}
                        className="me-2"
                        onError={(e) => {
                            // Fallback if logo image is not found
                            e.target.style.display = 'none'
                            e.target.nextElementSibling.style.display = 'inline'
                        }}
                    />
                    <span className="fw-bold" style={{ color: BRANDING.colors.primary }}>
                        {BRANDING.appName}
                    </span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link href="/bookings/create" className="nav-link">
                                        <i className="me-1">➕</i>
                                        Post Booking
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/dashboard" className="nav-link">
                                        <i className="me-1">📊</i>
                                        Dashboard
                                    </Link>
                                </li>
                                {user.userType === 'shipper' && (
                                    <li className="nav-item">
                                        <Link href="/bookings" className="nav-link">
                                            <i className="me-1">📦</i>
                                            My Bookings
                                        </Link>
                                    </li>
                                )}
                                {user.userType === 'carrier' && (
                                    <li className="nav-item">
                                        <Link href="/my-bids" className="nav-link">
                                            <i className="me-1">🚛</i>
                                            My Bids
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {loading ? (
                            <li className="nav-item">
                                <span className="nav-link">
                                    <div className="loading-spinner me-2"></div>
                                    Loading...
                                </span>
                            </li>
                        ) : user ? (
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle d-flex align-items-center"
                                    href="#"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                                            style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="d-none d-sm-inline">
                                            {user.name || user.email}
                                        </span>
                                    </div>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li>
                                        <div className="dropdown-header">
                                            <small className="text-muted">
                                                {user.userType === 'shipper' ? '📦 Shipper' : '🚛 Carrier'}
                                            </small>
                                        </div>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <Link href="/profile" className="dropdown-item">
                                            <i className="me-2">👤</i>
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/settings" className="dropdown-item">
                                            <i className="me-2">⚙️</i>
                                            Settings
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
                                            type="button"
                                        >
                                            <i className="me-2">🚪</i>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link href="/auth/login" className="nav-link">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/auth/register" className="btn btn-primary ms-2">
                                        Get Started
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}
