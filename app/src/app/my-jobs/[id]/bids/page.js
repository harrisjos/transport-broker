// @ts-nocheck
/**
 * Bid review page for shippers - allows shippers to view and accept/decline bids on their jobs
 */
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function BidReviewPage({ params }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [job, setJob] = useState(null)
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && user.organisationType !== 'shipper' && user.organisationType !== 'both') {
            router.push('/dashboard')
            return
        }

        if (user && params.id) {
            fetchJobAndBids()
        }
    }, [user, authLoading, router, params.id])

    const fetchJobAndBids = async () => {
        try {
            setLoading(true)

            // Fetch job details
            const jobResponse = await fetch(`/api/bookings/${params.id}`)
            const jobData = await jobResponse.json()

            if (jobResponse.ok) {
                setJob(jobData)
            } else {
                setError(jobData.error || 'Failed to fetch job details')
                return
            }

            // Fetch bids for this job
            const bidsResponse = await fetch(`/api/jobs/${params.id}/bids`)
            const bidsData = await bidsResponse.json()

            if (bidsResponse.ok) {
                setBids(bidsData.bids || [])
            } else {
                setError(bidsData.error || 'Failed to fetch bids')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleBidAction = async (bidId, action) => {
        try {
            setProcessing(bidId)
            setError('')
            setSuccess('')

            const response = await fetch(`/api/jobs/${params.id}/bids/${bidId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(`Bid ${action}ed successfully!`)
                // Refresh the data
                await fetchJobAndBids()
            } else {
                setError(data.error || `Failed to ${action} bid`)
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setProcessing(null)
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

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount)
    }

    const getBidStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-warning'
            case 'accepted': return 'bg-success'
            case 'rejected': return 'bg-danger'
            case 'expired': return 'bg-secondary'
            case 'withdrawn': return 'bg-dark'
            default: return 'bg-light text-dark'
        }
    }

    // Show loading while checking authentication
    if (authLoading || loading) {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading bids...</p>
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

    // Show error if not a shipper
    if (user.organisationType !== 'shipper' && user.organisationType !== 'both') {
        return (
            <div className="container my-5">
                <div className="alert alert-warning">
                    <h4 className="alert-heading">Access Restricted</h4>
                    <p>Only shipper organisations can review bids.</p>
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

    if (!job) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Job Not Found</h4>
                    <p>The requested job could not be found.</p>
                    <p className="mt-2">
                        <a href="/my-jobs" className="btn btn-primary">View My Jobs</a>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/my-jobs" className="text-decoration-none">My Jobs</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Booking #{params.id} - Bids Review
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Job Summary */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Job Summary - Booking #{job.id}</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <strong>Route:</strong> {job.origin_suburb}, {job.origin_state} → {job.destination_suburb}, {job.destination_state}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Pickup Date:</strong> {formatDate(job.pickup_date)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Standard Pallets:</strong> {job.standard_pallets || 0}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Total Weight:</strong> {job.total_weight || 'N/A'} kg
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <strong>Status:</strong>
                                        <span className={`badge ms-2 ${job.status === 'active' ? 'bg-success' :
                                            job.status === 'in_bidding' ? 'bg-warning' :
                                                job.status === 'assigned' ? 'bg-info' :
                                                    'bg-secondary'
                                            }`}>
                                            {job.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Posted:</strong> {formatDateTime(job.created_at)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Total Bids:</strong> {bids.length}
                                    </div>
                                    {job.goods_type_name && (
                                        <div className="mb-2">
                                            <strong>Goods Type:</strong> {job.goods_type_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {job.description && (
                                <div className="mt-3">
                                    <strong>Description:</strong>
                                    <p className="mt-1 mb-0">{job.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success" role="alert">
                    {success}
                </div>
            )}

            {/* Bids Section */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Received Bids ({bids.length})</h5>
                            {bids.length > 0 && (
                                <small className="text-muted">
                                    Lowest bid: {formatCurrency(Math.min(...bids.map(bid => bid.total_price)))}
                                </small>
                            )}
                        </div>
                        <div className="card-body">
                            {bids.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-gavel fa-4x text-muted mb-3"></i>
                                    <h4 className="text-muted">No Bids Yet</h4>
                                    <p className="text-muted">
                                        Carriers haven&#39;t placed any bids on this job yet.
                                    </p>
                                    {job.status === 'active' && (
                                        <p className="text-muted">
                                            Your job is listed as <strong>active</strong> and visible to carriers.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="row">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="col-lg-6 col-xl-4 mb-4">
                                            <div className="card border-start border-4 border-primary h-100">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h6 className="card-title mb-0">{bid.organisation_name}</h6>
                                                        <span className={`badge ${getBidStatusBadge(bid.status)}`}>
                                                            {bid.status.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="h4 text-success mb-1">{formatCurrency(bid.total_price)}</div>
                                                        <small className="text-muted">Bid Amount</small>
                                                    </div>

                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <small className="text-muted">Proposed Pickup:</small>
                                                            <div className="fw-bold">{formatDate(bid.proposed_collection_date)}</div>
                                                        </div>
                                                        <div className="col-6">
                                                            <small className="text-muted">Proposed Delivery:</small>
                                                            <div className="fw-bold">{formatDate(bid.proposed_delivery_date)}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <small className="text-muted">Valid Until:</small>
                                                        <div className="fw-bold">{formatDateTime(bid.valid_until)}</div>
                                                    </div>

                                                    {bid.message && (
                                                        <div className="mb-3">
                                                            <small className="text-muted">Carrier Notes:</small>
                                                            <p className="small mb-0">{bid.message}</p>
                                                        </div>
                                                    )}

                                                    {bid.terms_and_conditions && (
                                                        <div className="mb-3">
                                                            <small className="text-muted">Terms & Conditions:</small>
                                                            <p className="small mb-0">
                                                                {bid.terms_and_conditions.length > 100
                                                                    ? bid.terms_and_conditions.substring(0, 100) + '...'
                                                                    : bid.terms_and_conditions
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <small className="text-muted">Submitted:</small>
                                                        <div>{formatDateTime(bid.created_at)}</div>
                                                    </div>

                                                    {bid.status === 'pending' && (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-success btn-sm flex-fill"
                                                                onClick={() => handleBidAction(bid.id, 'accept')}
                                                                disabled={processing === bid.id}
                                                            >
                                                                {processing === bid.id ? (
                                                                    <span className="spinner-border spinner-border-sm me-1" />
                                                                ) : (
                                                                    <i className="fas fa-check me-1"></i>
                                                                )}
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm flex-fill"
                                                                onClick={() => handleBidAction(bid.id, 'reject')}
                                                                disabled={processing === bid.id}
                                                            >
                                                                {processing === bid.id ? (
                                                                    <span className="spinner-border spinner-border-sm me-1" />
                                                                ) : (
                                                                    <i className="fas fa-times me-1"></i>
                                                                )}
                                                                Decline
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}