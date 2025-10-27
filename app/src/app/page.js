// @ts-nocheck
/**
 * M8Freight Home Page - Mobile-First Landing Page
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../lib/auth-jwt'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BRANDING from '../config/branding'

export default function HomePage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard')
        }
    }, [user, loading, router])

    // Show loading while checking auth or redirecting
    if (loading || user) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading...</p>
            </div>
        )
    }

    return (
        <div className="container my-3">
            {/* Hero Section - Mobile-First */}
            <div className="row mb-4 mb-md-5">
                <div className="col-12 col-lg-8 mx-auto text-center">
                    <div className="mb-4">
                        <Image
                            src={BRANDING.assets.logo}
                            alt={`${BRANDING.appName} Logo`}
                            className="img-fluid mb-3"
                            width={120}
                            height={120}
                            style={{ maxHeight: '120px', width: 'auto' }}
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />
                        <h1 className="display-5 display-md-4 fw-bold mb-3" style={{ color: BRANDING.colors.primary }}>
                            {BRANDING.appName}
                        </h1>
                    </div>
                    <h2 className="h4 h-md-3 mb-3 text-light">
                        {BRANDING.tagline}
                    </h2>
                    <p className="lead mb-4 text-muted">
                        The premier marketplace for transport and logistics. Post your freight bookings or find delivery opportunities in seconds.
                    </p>

                    {/* Mobile-First CTA Buttons */}
                    {!user ? (
                        <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                            <Link href="/auth/register" className="btn btn-primary btn-lg">
                                <i className="me-2">🚀</i>
                                Get Started Free
                            </Link>
                            <Link href="/jobs" className="btn btn-outline-primary btn-lg">
                                <i className="me-2">📋</i>
                                Browse Bookings
                            </Link>
                        </div>
                    ) : (
                        <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                            <Link href="/bookings/create" className="btn btn-primary btn-lg">
                                <i className="me-2">➕</i>
                                Post a Booking
                            </Link>
                            <Link href="/dashboard" className="btn btn-outline-primary btn-lg">
                                <i className="me-2">📊</i>
                                Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section - Mobile Stacked */}
            <div className="row mb-4 mb-md-5 g-3 g-md-4">
                <div className="col-12 col-md-6 col-lg-4 mb-3 mb-lg-0">
                    <div className="card h-100 text-center bg-dark-card">
                        <div className="card-body">
                            <div className="display-1 mb-3" style={{ color: BRANDING.colors.primary }}>📦</div>
                            <h5 className="card-title text-light">Post Jobs</h5>
                            <p className="card-text text-muted">
                                Create detailed freight jobs with pickup and delivery locations, time windows, and special requirements.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4 mb-3 mb-lg-0">
                    <div className="card h-100 text-center bg-dark-card">
                        <div className="card-body">
                            <div className="display-1 mb-3" style={{ color: BRANDING.colors.primary }}>🚛</div>
                            <h5 className="card-title text-light">Find Carriers</h5>
                            <p className="card-text text-muted">
                                Browse available carriers, compare quotes, and choose the best option for your transport needs.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4 mb-3 mb-lg-0">
                    <div className="card h-100 text-center bg-dark-card">
                        <div className="card-body">
                            <div className="display-1 mb-3" style={{ color: BRANDING.colors.primary }}>📍</div>
                            <h5 className="card-title text-light">Track Delivery</h5>
                            <p className="card-text text-muted">
                                Real-time tracking, delivery notifications, and proof of delivery for complete transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>



            {/* CTA Section - Mobile-First */}
            <div className="row">
                <div className="col-12">
                    <div className="card text-center p-4 p-md-5" style={{ backgroundColor: BRANDING.colors.primary }}>
                        <div className="card-body">
                            <h3 className="card-title text-white mb-3">Ready to get started?</h3>
                            <p className="card-text text-white mb-4">
                                Join thousands of shippers and carriers already using {BRANDING.appName}
                            </p>
                            {!user ? (
                                <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                                    <Link href="/auth/register" className="btn btn-light btn-lg">
                                        <i className="me-2">📝</i>
                                        Sign Up Now
                                    </Link>
                                    <Link href="/auth/login" className="btn btn-outline-primary btn-lg">
                                        <i className="me-2">🔑</i>
                                        Login
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/jobs/create" className="btn btn-light btn-lg">
                                    <i className="me-2">🚀</i>
                                    Post Your First Job
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
