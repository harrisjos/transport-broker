// @ts-check
/**
 * Home page component - main landing page for transport broker
 */
'use client'

import Link from 'next/link'
import { useAuth } from '../lib/auth'

export default function HomePage() {
    const { user } = useAuth()

    return (
        <div className="container my-5">
            {/* Hero Section */}
            <div className="row mb-5">
                <div className="col-lg-8 mx-auto text-center">
                    <h1 className="display-4 fw-bold mb-3">
                        Connect Carriers with Customers
                    </h1>
                    <p className="lead mb-4">
                        The premier marketplace for transport and logistics. Post your freight jobs or find delivery opportunities in seconds.
                    </p>
                    {!user ? (
                        <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <Link href="/auth/register" className="btn btn-primary btn-lg me-md-2">
                                Get Started
                            </Link>
                            <Link href="/jobs" className="btn btn-outline-primary btn-lg">
                                Browse Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <Link href="/jobs/create" className="btn btn-primary btn-lg me-md-2">
                                Post a Job
                            </Link>
                            <Link href="/dashboard" className="btn btn-outline-primary btn-lg">
                                Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="row mb-5">
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <div className="display-1 text-primary mb-3">📦</div>
                            <h5 className="card-title">Post Jobs</h5>
                            <p className="card-text">
                                Create detailed freight jobs with pickup and delivery locations, time windows, and special requirements.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <div className="display-1 text-primary mb-3">🚛</div>
                            <h5 className="card-title">Find Carriers</h5>
                            <p className="card-text">
                                Browse available carriers, compare quotes, and choose the best option for your transport needs.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <div className="display-1 text-primary mb-3">📍</div>
                            <h5 className="card-title">Track Delivery</h5>
                            <p className="card-text">
                                Real-time tracking, delivery notifications, and proof of delivery for complete transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="row mb-5 bg-light rounded p-4">
                <div className="col-md-4 text-center mb-3">
                    <h3 className="text-primary fw-bold">500+</h3>
                    <p className="mb-0">Active Carriers</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                    <h3 className="text-primary fw-bold">1,200+</h3>
                    <p className="mb-0">Jobs Completed</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                    <h3 className="text-primary fw-bold">98%</h3>
                    <p className="mb-0">Customer Satisfaction</p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="row">
                <div className="col-lg-8 mx-auto text-center">
                    <h2 className="mb-3">Ready to Get Started?</h2>
                    <p className="lead mb-4">
                        Join thousands of customers and carriers using our platform to streamline their logistics operations.
                    </p>
                    {!user && (
                        <Link href="/auth/register" className="btn btn-primary btn-lg">
                            Create Your Account
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}