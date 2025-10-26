'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({
        bookings: { total: 0, active: 0, completed: 0 },
        bids: { total: 0, pending: 0, accepted: 0 },
        recentActivity: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchDashboardData()
        }
    }, [user, authLoading, router])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // For shippers: Fetch their created jobs
            if (user.organizationType === 'shipper' || user.organizationType === 'both') {
                const bookingsResponse = await fetch('/api/bookings?my_jobs=true&limit=5')
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json()
                    const bookings = bookingsData.bookings || []
                    setStats(prev => ({
                        ...prev,
                        bookings: {
                            total: bookings.length,
                            active: bookings.filter(b => b.status === 'active' || b.status === 'in_bidding').length,
                            completed: bookings.filter(b => b.status === 'completed').length
                        },
                        recentActivity: bookings.slice(0, 5)
                    }))
                }
            }

            // For carriers: Fetch their accepted jobs
            if (user.organizationType === 'carrier' || user.organizationType === 'both') {
                try {
                    // Fetch accepted bids/jobs for carrier
                    const bidsResponse = await fetch('/api/bids/my-accepted?limit=5')
                    if (bidsResponse.ok) {
                        const bidsData = await bidsResponse.json()
                        const acceptedJobs = bidsData.jobs || []
                        setStats(prev => ({
                            ...prev,
                            bids: {
                                total: acceptedJobs.length,
                                pending: 0, // Will update when we have pending bids API
                                accepted: acceptedJobs.length
                            },
                            recentActivity: acceptedJobs.slice(0, 5)
                        }))
                    } else {
                        // Fallback for now - just show empty data
                        setStats(prev => ({
                            ...prev,
                            bids: { total: 0, pending: 0, accepted: 0 },
                            recentActivity: []
                        }))
                    }
                } catch (bidError) {
                    console.log('Bids API not available yet, showing empty data')
                    setStats(prev => ({
                        ...prev,
                        bids: { total: 0, pending: 0, accepted: 0 },
                        recentActivity: []
                    }))
                }
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    const isShipper = user.organizationType === 'shipper' || user.organizationType === 'both'
    const isCarrier = user.organizationType === 'carrier' || user.organizationType === 'both'

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Dashboard</h1>
                        <span className="badge bg-primary fs-6">
                            {user.organisationType === 'both' ? 'Shipper & Carrier' :
                                user.organisationType === 'shipper' ? 'Shipper' : 'Carrier'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                {isShipper && (
                    <>
                        <div className="col-md-4">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bookings.total}</h4>
                                            <p className="card-text">Total Bookings</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-shipping-fast fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bookings.active}</h4>
                                            <p className="card-text">Active Bookings</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-clock fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-info text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bookings.completed}</h4>
                                            <p className="card-text">Completed</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-check-circle fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {isCarrier && (
                    <>
                        <div className="col-md-4">
                            <div className="card bg-warning text-dark">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bids.total}</h4>
                                            <p className="card-text">Total Bids</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-handshake fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-secondary text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bids.pending}</h4>
                                            <p className="card-text">Pending Bids</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-hourglass-half fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h4 className="card-title">{stats.bids.accepted}</h4>
                                            <p className="card-text">Accepted Bids</p>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fas fa-trophy fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {isShipper && (
                                    <>
                                        <div className="col-md-3 mb-2">
                                            <a href="/bookings/create" className="btn btn-primary w-100">
                                                <i className="fas fa-plus me-2"></i>
                                                Create Booking
                                            </a>
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <a href="/bookings" className="btn btn-outline-primary w-100">
                                                <i className="fas fa-list me-2"></i>
                                                View Bookings
                                            </a>
                                        </div>
                                    </>
                                )}
                                {isCarrier && (
                                    <>
                                        <div className="col-md-3 mb-2">
                                            <a href="/jobs" className="btn btn-success w-100">
                                                <i className="fas fa-search me-2"></i>
                                                Browse Jobs
                                            </a>
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <a href="/bids" className="btn btn-outline-success w-100">
                                                <i className="fas fa-handshake me-2"></i>
                                                My Bids
                                            </a>
                                        </div>
                                    </>
                                )}
                                <div className="col-md-3 mb-2">
                                    <a href="/profile" className="btn btn-outline-secondary w-100">
                                        <i className="fas fa-user me-2"></i>
                                        Profile
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                {isShipper && 'My Recent Jobs'}
                                {isCarrier && !isShipper && 'My Accepted Jobs'}
                                {isShipper && isCarrier && 'Recent Activity'}
                            </h5>
                            <div>
                                {isShipper && (
                                    <a href="/my-jobs" className="btn btn-outline-primary btn-sm me-2">
                                        View All Jobs
                                    </a>
                                )}
                                {isCarrier && (
                                    <a href="/my-accepted-jobs" className="btn btn-outline-success btn-sm">
                                        View All Accepted
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Job ID</th>
                                                <th>Route</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentActivity.map((job) => (
                                                <tr key={job.id}>
                                                    <td>
                                                        <span className="fw-bold">#{job.id}</span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-circle text-success me-1" style={{ fontSize: '6px' }}></i>
                                                            <small className="me-2">{job.origin_suburb}, {job.origin_state}</small>
                                                            <i className="fas fa-arrow-right text-muted me-2"></i>
                                                            <i className="fas fa-circle text-danger me-1" style={{ fontSize: '6px' }}></i>
                                                            <small>{job.destination_suburb}, {job.destination_state}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${job.status === 'active' ? 'bg-success' :
                                                            job.status === 'in_bidding' ? 'bg-warning' :
                                                                job.status === 'assigned' ? 'bg-info' :
                                                                    job.status === 'in_transit' ? 'bg-primary' :
                                                                        job.status === 'completed' ? 'bg-secondary' :
                                                                            'bg-light text-dark'
                                                            }`}>
                                                            {job.status?.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>{new Date(job.pickup_date || job.created_at).toLocaleDateString('en-AU')}</small>
                                                    </td>
                                                    <td>
                                                        {isShipper && (
                                                            <div className="btn-group" role="group">
                                                                <a href={`/my-jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                                                                    <i className="fas fa-eye"></i>
                                                                </a>
                                                                {(job.status === 'in_bidding' || job.status === 'assigned') && (
                                                                    <a href={`/my-jobs/${job.id}/bids`} className="btn btn-outline-warning btn-sm">
                                                                        <i className="fas fa-gavel"></i>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        {isCarrier && !isShipper && (
                                                            <a href={`/jobs/${job.id}`} className="btn btn-outline-success btn-sm">
                                                                <i className="fas fa-truck"></i>
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">
                                        {isShipper && !isCarrier && 'No jobs posted yet'}
                                        {isCarrier && !isShipper && 'No accepted jobs yet'}
                                        {isShipper && isCarrier && 'No recent activity'}
                                    </h6>
                                    <small className="text-muted">
                                        {isShipper && !isCarrier && 'Create your first transport job to get started'}
                                        {isCarrier && !isShipper && 'Browse available jobs and place bids to get started'}
                                        {isShipper && isCarrier && 'Activity will appear here as you use the platform'}
                                    </small>
                                    <div className="mt-3">
                                        {isShipper && (
                                            <a href="/book" className="btn btn-primary me-2">
                                                <i className="fas fa-plus me-1"></i>
                                                Post First Job
                                            </a>
                                        )}
                                        {isCarrier && (
                                            <a href="/jobs" className="btn btn-success">
                                                <i className="fas fa-search me-1"></i>
                                                Browse Jobs
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
