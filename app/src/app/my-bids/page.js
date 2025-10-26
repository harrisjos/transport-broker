// @ts-nocheck
/**
 * M8Freight My Bids Page - Mobile-First Design
 * Displays bids and accepted jobs for carriers with status update functionality
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'
import BRANDING from '../../config/branding'

export default function MyBidsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [bids, setBids] = useState([])
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

        // Check if user has carrier access
        if (!authLoading && user && user.organisationType !== 'carrier' && user.organisationType !== 'both') {
            router.push('/dashboard')
            return
        }

        if (!authLoading && user) {
            fetchMyBids()
        }
    }, [user, authLoading, router, filters])

    const fetchMyBids = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                my_bids: 'true',
                status: filters.status,
                page: filters.page.toString(),
                limit: '10'
            })

            const response = await fetch(`/api/bids?${params}`)
            const data = await response.json()

            if (response.ok) {
                setBids(data.bids || [])
                setError('')
            } else {
                setError(data.error || 'Failed to fetch bids')
            }
        } catch (error) {
            console.error('Error fetching bids:', error)
            setError('Failed to fetch bids')
        } finally {
            setLoading(false)
        }
    }, [filters])

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="loading-spinner mx-auto mb-3"></div>
                            <p className="text-muted">Loading your bids...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Redirect if not authenticated or not a carrier
    if (!user || (user.organisationType !== 'carrier' && user.organisationType !== 'both')) {
        return null
    }

    const handleUpdateJobStatus = async (bidId, jobId, newStatus) => {
        if (!confirm(`Are you sure you want to update this job status to "${newStatus.replace('_', ' ')}"?`)) {
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
                    status: newStatus,
                    bidId: bidId
                }),
            })

            if (response.ok) {
                // Refresh the bids list
                fetchMyBids()
                alert(`Job status updated to "${newStatus.replace('_', ' ')}" successfully`)
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to update job status')
            }
        } catch (error) {
            console.error('Error updating job status:', error)
            setError('Failed to update job status')
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

    const getBidStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-warning text-dark'
            case 'accepted': return 'bg-success'
            case 'rejected': return 'bg-danger'
            case 'expired': return 'bg-secondary'
            default: return 'bg-info'
        }
    }

    const getJobStatusBadgeClass = (status) => {
        switch (status) {
            case 'in_transit': return 'bg-primary'
            case 'delivered': return 'bg-info'
            case 'completed': return 'bg-success'
            case 'cancelled': return 'bg-danger'
            default: return 'bg-warning text-dark'
        }
    }

    const canUpdateStatus = (bid) => {
        return bid.status === 'accepted' && bid.job &&
            ['assigned', 'in_transit', 'delivered'].includes(bid.job.status)
    }

    const getNextStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'assigned':
                return [{ value: 'in_transit', label: 'Start Transport' }]
            case 'in_transit':
                return [{ value: 'delivered', label: 'Mark as Delivered' }]
            case 'delivered':
                return [{ value: 'completed', label: 'Complete Job' }]
            default:
                return []
        }
    }

    return (
        <div className="container-fluid py-3">
            <div className="row">
                <div className="col-12">
                    {/* Mobile-First Header */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                        <h1 className="h3 h-md-2 text-light mb-0">My Bids & Jobs</h1>
                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                            <span className="badge bg-primary fs-6 px-3 py-2">
                                {bids.length} bids found
                            </span>
                            <Link href="/jobs" className="btn btn-primary">
                                <i className="me-1">🔍</i>
                                Browse Jobs
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
                                        <option value="all">All Bids</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted Jobs</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-4">
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => fetchMyBids()}
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

            {/* Bids List - Mobile-First Cards */}
            {loading ? (
                <div className="row">
                    <div className="col-12">
                        <div className="text-center py-5">
                            <div className="loading-spinner mx-auto mb-3"></div>
                            <p className="text-muted">Loading your bids...</p>
                        </div>
                    </div>
                </div>
            ) : bids.length === 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="text-center py-5">
                            <div className="mb-4" style={{ fontSize: '4rem' }}>🚛</div>
                            <h3 className="text-light mb-3">No Bids Found</h3>
                            <p className="text-muted mb-4">You haven&apos;t placed any bids yet</p>
                            <Link href="/jobs" className="btn btn-primary btn-lg">
                                <i className="me-2">🔍</i>
                                Browse Available Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {bids.map((bid) => (
                        <div key={bid.id} className="col-12 col-md-6 col-lg-4 mb-3">
                            <div className="card h-100 bg-dark-card border-dark">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 className="card-title text-primary mb-1">
                                                Job #{bid.job?.id || 'N/A'}
                                            </h6>
                                            <small className="text-muted">Bid #{bid.id}</small>
                                        </div>
                                        <div className="text-end">
                                            <span className={`badge ${getBidStatusBadgeClass(bid.status)} mb-1`}>
                                                {bid.status?.toUpperCase()}
                                            </span>
                                            {bid.job && (
                                                <div>
                                                    <span className={`badge ${getJobStatusBadgeClass(bid.job.status)}`}>
                                                        {bid.job.status?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bid Amount */}
                                    <div className="mb-3">
                                        <small className="text-muted">Your Bid:</small>
                                        <div className="fw-bold text-success h5">
                                            ${parseFloat(bid.amount || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Job Route */}
                                    {bid.job && (
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="text-success me-2" style={{ fontSize: '12px' }}>🟢</span>
                                                <small className="text-muted">From:</small>
                                            </div>
                                            <div className="ms-3 mb-2">
                                                <small className="text-light">
                                                    {bid.job.origin_suburb}, {bid.job.origin_state}
                                                </small>
                                            </div>

                                            <div className="d-flex align-items-center mb-2">
                                                <span className="text-danger me-2" style={{ fontSize: '12px' }}>🔴</span>
                                                <small className="text-muted">To:</small>
                                            </div>
                                            <div className="ms-3">
                                                <small className="text-light">
                                                    {bid.job.destination_suburb}, {bid.job.destination_state}
                                                </small>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pickup Date */}
                                    {bid.pickup_date && (
                                        <div className="mb-3">
                                            <small className="text-muted">Pickup Date:</small>
                                            <div className="text-light">{formatDate(bid.pickup_date)}</div>
                                        </div>
                                    )}

                                    {/* Delivery Date */}
                                    {bid.delivery_date && (
                                        <div className="mb-3">
                                            <small className="text-muted">Delivery Date:</small>
                                            <div className="text-light">{formatDate(bid.delivery_date)}</div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {bid.notes && (
                                        <div className="mb-3">
                                            <small className="text-muted">Notes:</small>
                                            <p className="small text-light mb-0">
                                                {bid.notes.length > 100
                                                    ? bid.notes.substring(0, 100) + '...'
                                                    : bid.notes
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer bg-dark-card">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <small className="text-muted">
                                            Bid placed: {formatDate(bid.created_at)}
                                        </small>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {/* Status Update Buttons for Accepted Jobs */}
                                            {canUpdateStatus(bid) && getNextStatusOptions(bid.job.status).map((option) => (
                                                <button
                                                    key={option.value}
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleUpdateJobStatus(bid.id, bid.job.id, option.value)}
                                                    disabled={loading}
                                                >
                                                    <i className="me-1">🚀</i>
                                                    {option.label}
                                                </button>
                                            ))}

                                            {/* View Job Details */}
                                            {bid.job && (
                                                <Link href={`/jobs/${bid.job.id}`} className="btn btn-primary btn-sm">
                                                    <i className="me-1">👁️</i>
                                                    View Job
                                                </Link>
                                            )}
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