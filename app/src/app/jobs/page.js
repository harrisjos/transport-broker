// @ts-nocheck
/**
 * Jobs listing page - displays available transport jobs for carriers
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function JobsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        status: 'active',
        page: 1
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && user.organizationType !== 'carrier' && user.organizationType !== 'both') {
            router.push('/dashboard')
            return
        }

        if (user) {
            fetchJobs()
        }
    }, [user, authLoading, router, filters])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                status: filters.status,
                page: filters.page.toString(),
                limit: '10'
            })

            const response = await fetch(`/api/bookings?${params}`)
            const data = await response.json()

            if (response.ok) {
                setJobs(data.bookings || [])
            } else {
                setError(data.error || 'Failed to fetch jobs')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading jobs...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return null
    }

    // Show error if not a carrier
    if (user.organisationType !== 'carrier' && user.organisationType !== 'both') {
        return (
            <div className="container my-5">
                <div className="alert alert-warning">
                    <h4 className="alert-heading">Access Restricted</h4>
                    <p>Only carrier organisations can browse available jobs.</p>
                    <hr />
                    <p className="mb-0">
                        Your organisation type: <strong>{user.organisationType}</strong>
                    </p>
                    <p className="mt-2">
                        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
                    </p>
                </div>
            </div>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Available Jobs</h1>
                        <span className="badge bg-info fs-6">
                            {jobs.length} jobs available
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select
                                        id="status"
                                        className="form-select"
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="active">Active Jobs</option>
                                        <option value="all">All Jobs</option>
                                    </select>
                                </div>
                                <div className="col-md-6 d-flex align-items-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => fetchJobs()}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading available jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                    <h3 className="text-muted">No Jobs Available</h3>
                    <p className="text-muted">Check back later for new transport opportunities</p>
                </div>
            ) : (
                <div className="row">
                    {jobs.map((job) => (
                        <div key={job.id} className="col-lg-6 col-xl-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="card-title text-primary mb-0">
                                            Booking #{job.id}
                                        </h6>
                                        <span className={`badge ${job.status === 'active' ? 'bg-success' :
                                            job.status === 'in_bidding' ? 'bg-warning' :
                                                job.status === 'assigned' ? 'bg-info' :
                                                    'bg-secondary'
                                            }`}>
                                            {job.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Goods Type */}
                                    {job.goods_type_name && (
                                        <div className="mb-2">
                                            <small className="text-muted">Goods Type:</small>
                                            <div className="fw-bold">{job.goods_type_name}</div>
                                        </div>
                                    )}

                                    {/* Route */}
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-1">
                                            <i className="fas fa-circle text-success me-2" style={{ fontSize: '8px' }}></i>
                                            <small className="text-muted">From:</small>
                                        </div>
                                        <div className="ms-3 mb-2">
                                            <strong>{job.origin_suburb}, {job.origin_state} {job.origin_postcode}</strong>
                                        </div>

                                        <div className="d-flex align-items-center mb-1">
                                            <i className="fas fa-circle text-danger me-2" style={{ fontSize: '8px' }}></i>
                                            <small className="text-muted">To:</small>
                                        </div>
                                        <div className="ms-3">
                                            <strong>{job.destination_suburb}, {job.destination_state} {job.destination_postcode}</strong>
                                        </div>
                                    </div>

                                    {/* Shipment Details */}
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <small className="text-muted">Standard Pallets:</small>
                                            <div className="fw-bold">{job.standard_pallets || 0}</div>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted">Weight:</small>
                                            <div className="fw-bold">{job.total_weight || 'N/A'} kg</div>
                                        </div>
                                    </div>

                                    {/* Pickup Date */}
                                    <div className="mb-3">
                                        <small className="text-muted">Pickup Date:</small>
                                        <div className="fw-bold">{formatDate(job.pickup_date)}</div>
                                    </div>

                                    {/* Description */}
                                    {job.description && (
                                        <div className="mb-3">
                                            <small className="text-muted">Description:</small>
                                            <p className="small mb-0">
                                                {job.description.length > 100
                                                    ? job.description.substring(0, 100) + '...'
                                                    : job.description
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Posted: {formatDate(job.created_at)}
                                        </small>
                                        <Link href={`/jobs/${job.id}/bid`} className="btn btn-primary btn-sm">
                                            <i className="fas fa-handshake me-1"></i>
                                            Place Bid
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
