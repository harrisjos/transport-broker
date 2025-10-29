// @ts-nocheck
/**
 * M8Freight My Jobs Page - Mobile-First Design
 * Displays jobs posted by the current shipper with edit/cancel functionality
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function MyJobsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        status: 'all',
        page: 1
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        // Check if user has shipper access - for now, allow all authenticated users
        // This can be refined later based on organisation relationships
        if (!authLoading && user) {
            fetchMyJobs()
        }
    }, [user, authLoading, router, filters, fetchMyJobs])

    const fetchMyJobs = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                my_jobs: 'true',
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
    }, [filters.status, filters.page])

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
                            <p className="mt-2">Loading your jobs...</p>
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

    const handleCancelJob = async (jobId) => {
        if (!confirm('Are you sure you want to cancel this job? This action cannot be undone.')) {
            return
        }

        try {
            setLoading(true)
            const response = await fetch(`/api/bookings/${jobId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'cancelled'
                }),
            })

            if (response.ok) {
                // Refresh the jobs list
                fetchMyJobs()
                alert('Job cancelled successfully')
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to cancel job')
            }
        } catch (error) {
            console.error('Error cancelling job:', error)
            setError('Failed to cancel job')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'bg-success'
            case 'in_bidding': return 'bg-warning'
            case 'assigned': return 'bg-info'
            case 'in_transit': return 'bg-primary'
            case 'completed': return 'bg-secondary'
            case 'cancelled': return 'bg-danger'
            default: return 'bg-light text-dark'
        }
    }

    return (
        <div className="container-fluid py-3">
            <div className="row">
                <div className="col-12">
                    {/* Mobile-First Header */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                        <h1 className="h3 h-md-2 text-light mb-0">My Posted Jobs</h1>
                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                            <span className="badge bg-primary fs-6 px-3 py-2">
                                {jobs.length} jobs found
                            </span>
                            <Link href="/book" className="btn btn-primary">
                                <i className="me-1">➕</i>
                                Post New Job
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-First Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-dark-card">
                        <div className="card-body p-3">
                            <div className="row align-items-end g-3">
                                <div className="col-12 col-md-8">
                                    <label htmlFor="status" className="form-label text-light">Filter by Status</label>
                                    <select
                                        id="status"
                                        className="form-select"
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="all">All Jobs</option>
                                        <option value="active">Active (No Bids)</option>
                                        <option value="in_bidding">Receiving Bids</option>
                                        <option value="assigned">Assigned to Carrier</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-4">
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => fetchMyJobs()}
                                        disabled={loading}
                                    >
                                        <i className="me-1">🔄</i>
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs List - Mobile-First Cards */}
            {error && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="row">
                    <div className="col-12">
                        <div className="text-center py-5">
                            <div className="loading-spinner mx-auto mb-3"></div>
                            <p className="text-muted">Loading your jobs...</p>
                        </div>
                    </div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="text-center py-5">
                            <div className="mb-4" style={{ fontSize: '4rem' }}>📦</div>
                            <h3 className="text-light mb-3">No Jobs Found</h3>
                            <p className="text-muted mb-4">You haven&apos;t posted any transport jobs yet</p>
                            <Link href="/book" className="btn btn-primary btn-lg">
                                <i className="me-2">➕</i>
                                Post Your First Job
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {jobs.map((job) => (
                        <div key={job.id} className="col-12 col-md-6 col-lg-4 mb-3">
                            <div className="card h-100 bg-dark-card border-dark">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h6 className="card-title text-primary mb-0">
                                            Booking #{job.id}
                                        </h6>
                                        <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                                            {job.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Goods Type */}
                                    {job.goods_type_name && (
                                        <div className="mb-3">
                                            <small className="text-muted">Goods Type:</small>
                                            <div className="fw-bold text-light">{job.goods_type_name}</div>
                                        </div>
                                    )}

                                    {/* Route - Mobile Optimised */}
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="text-success me-2" style={{ fontSize: '12px' }}>🟢</span>
                                            <small className="text-muted">From:</small>
                                        </div>
                                        <div className="ms-3 mb-3">
                                            <strong className="text-light">
                                                {job.origin_suburb}, {job.origin_state} {job.origin_postcode}
                                            </strong>
                                        </div>

                                        <div className="d-flex align-items-center mb-2">
                                            <span className="text-danger me-2" style={{ fontSize: '12px' }}>🔴</span>
                                            <small className="text-muted">To:</small>
                                        </div>
                                        <div className="ms-3">
                                            <strong className="text-light">
                                                {job.destination_suburb}, {job.destination_state} {job.destination_postcode}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Shipment Details */}
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <small className="text-muted">Standard Pallets:</small>
                                            <div className="fw-bold text-light">{job.standard_pallets || 0}</div>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted">Weight:</small>
                                            <div className="fw-bold text-light">{job.total_weight || 'N/A'} kg</div>
                                        </div>
                                    </div>

                                    {/* Pickup Date */}
                                    <div className="mb-3">
                                        <small className="text-muted">Pickup Date:</small>
                                        <div className="fw-bold text-light">{formatDate(job.pickup_date)}</div>
                                    </div>

                                    {/* Description */}
                                    {job.description && (
                                        <div className="mb-3">
                                            <small className="text-muted">Description:</small>
                                            <p className="small text-light mb-0">
                                                {job.description.length > 100
                                                    ? job.description.substring(0, 100) + '...'
                                                    : job.description
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer bg-dark-card">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <small className="text-muted">
                                            Posted: {formatDate(job.created_at)}
                                        </small>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {/* Edit button - only show for open status jobs */}
                                            {job.status === 'open' && (
                                                <Link href={`/jobs/edit/${job.id}`} className="btn btn-outline-primary btn-sm">
                                                    <i className="fas fa-edit me-1"></i>
                                                    Edit
                                                </Link>
                                            )}

                                            {/* Cancel button - only show for jobs not yet completed */}
                                            {(job.status !== 'completed' && job.status !== 'cancelled') && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleCancelJob(job.id)}
                                                    disabled={loading}
                                                >
                                                    <i className="fas fa-times me-1"></i>
                                                    Cancel
                                                </button>
                                            )}

                                            {(job.status === 'in_bidding' || job.status === 'assigned') && (
                                                <Link href={`/bookings/${job.uuid}/bids`} className="btn btn-warning btn-sm">
                                                    <i className="fas fa-gavel me-1"></i>
                                                    View Bids
                                                </Link>
                                            )}
                                            <Link href={`/bookings/${job.uuid}`} className="btn btn-primary btn-sm">
                                                <i className="fas fa-eye me-1"></i>
                                                Details
                                            </Link>
                                        </div>
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
