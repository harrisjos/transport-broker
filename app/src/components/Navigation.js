// @ts-check
/**
 * Navigation component with Bootstrap styling and user authentication
 */
'use client'

import Link from 'next/link'
import { useAuth } from '../lib/auth'

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
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand">
                    🚛 Transport Broker
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
                        <li className="nav-item">
                            <Link href="/jobs" className="nav-link">
                                Browse Jobs
                            </Link>
                        </li>
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link href="/jobs/create" className="nav-link">
                                        Post Job
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/dashboard" className="nav-link">
                                        Dashboard
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {loading ? (
                            <li className="nav-item">
                                <span className="nav-link">Loading...</span>
                            </li>
                        ) : user ? (
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {user.displayName || user.email}
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li>
                                        <Link href="/profile" className="dropdown-item">
                                            Profile
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={handleLogout}
                                            type="button"
                                        >
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
                                    <Link href="/auth/register" className="nav-link">
                                        Register
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