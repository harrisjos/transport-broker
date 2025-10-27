// @ts-nocheck
/**
 * Bid review page for shippers - allows shippers to view and accept/decline bids on their jobs
 * Updated to use UUID-based routing for security
 */
'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useAuth } from '../../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function BidReviewPage({ params }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const resolvedParams = use(params)
    const [job, setJob] = useState(null)
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchJobAndBids = useCallback(async () => {
        try {
            setLoading(true)

            // Fetch job details using UUID
            const jobResponse = await fetch(`/api/bookings/uuid/${resolvedParams.uuid}`)
            const jobData = await jobResponse.json()

            if (jobResponse.ok) {
                setJob(jobData)
            } else {
                setError(jobData.error || 'Failed to fetch job details')
                return
            }

            // Fetch bids for this job using UUID
            const bidsResponse = await fetch(`/api/bookings/uuid/${resolvedParams.uuid}/bids`)
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
    }, [resolvedParams.uuid])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && user.organisationType !== 'shipper' && user.organisationType !== 'both') {
            router.push('/dashboard')
            return
        }

        if (user && resolvedParams.uuid) {
            fetchJobAndBids()
        }
    }, [user, authLoading, router, resolvedParams.uuid, fetchJobAndBids])

    const handleBidAction = async (bidId, action) => {
        try {
            setProcessing(bidId)
            setError('')
            setSuccess('')

            const response = await fetch(`/api/bookings/uuid/${resolvedParams.uuid}/bids/${bidId}`, {
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

    const formatCurrency = (amount) => {
        if (!amount) return 'Not specified'
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount)
    }

    const getBidStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'bg-warning', text: 'Pending Review' },
            accepted: { class: 'bg-success', text: 'Accepted' },
            rejected: { class: 'bg-danger', text: 'Rejected' },
            withdrawn: { class: 'bg-secondary', text: 'Withdrawn' }
        }

        const badge = statusMap[status] || { class: 'bg-light text-dark', text: status }
        return (
            <span className={`badge ${badge.class}`}>
                {badge.text}
            </span>
        )
    }

    if (authLoading || loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading bid details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <p className="mt-2">
                        <a href="/bookings" className="btn btn-primary">View My Jobs</a>
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
                        <a href="/bookings" className="btn btn-primary">View My Jobs</a>
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
                                <a href="/bookings" className="text-decoration-none">My Jobs</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Booking - Bids Review
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="alert alert-success alert-dismissible fade show">
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="alert alert-danger alert-dismissible fade show">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Summary */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-truck me-2"></i>
                                Job Summary
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3">Route Details</h6>
                                    <div className="mb-3">
                                        <i className="fas fa-circle text-success me-2"></i>
                                        <strong>From:</strong> {job.origin_name}
                                        <br />
                                        <small className="text-muted ms-4">
                                            {job.origin_suburb}, {job.origin_state} {job.origin_postcode}
                                        </small>
                                    </div>
                                    <div className="mb-3">
                                        <i className="fas fa-circle text-danger me-2"></i>
                                        <strong>To:</strong> {job.destination_name}
                                        <br />
                                        <small className="text-muted ms-4">
                                            {job.destination_suburb}, {job.destination_state} {job.destination_postcode}
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3">Job Details</h6>
                                    <p><strong>Pallets:</strong> {job.pallets}</p>
                                    <p><strong>Goods Type:</strong> {job.goods_type_name || 'Not specified'}</p>
                                    <p><strong>Collection Date:</strong> {formatDate(job.collection_date_requested)}</p>
                                    <p><strong>Budget Range:</strong> {formatCurrency(job.budget_minimum)} - {formatCurrency(job.budget_maximum)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bids Section */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-gavel me-2"></i>
                                Received Bids ({bids.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {bids.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No bids received yet.</p>
                                    <p><small>Carriers will be able to submit bids once your job is published.</small></p>
                                </div>
                            ) : (
                                <div className="row">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="col-lg-6 mb-4">
                                            <div className="card">
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="mb-0">{bid.carrier_name}</h6>
                                                        <small className="text-muted">{bid.carrier_organization_name}</small>
                                                    </div>
                                                    {getBidStatusBadge(bid.status)}
                                                </div>
                                                <div className="card-body">
                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <p className="mb-1"><strong>Bid Amount:</strong></p>
                                                            <h5 className="text-primary mb-0">{formatCurrency(bid.amount)}</h5>
                                                        </div>
                                                        <div className="col-6">
                                                            <p className="mb-1"><strong>Proposed Date:</strong></p>
                                                            <p className="mb-0">{formatDate(bid.proposed_pickup_date)}</p>
                                                        </div>
                                                    </div>

                                                    {bid.notes && (
                                                        <div className="mb-3">
                                                            <p className="mb-1"><strong>Carrier Notes:</strong></p>
                                                            <p className="text-muted small">{bid.notes}</p>
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <p className="mb-1"><strong>Submitted:</strong></p>
                                                        <small className="text-muted">{formatDate(bid.created_at)}</small>
                                                    </div>

                                                    {bid.status === 'pending' && (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-success btn-sm flex-fill"
                                                                onClick={() => handleBidAction(bid.id, 'accept')}
                                                                disabled={processing === bid.id}
                                                            >
                                                                {processing === bid.id ? (
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                ) : (
                                                                    <i className="fas fa-check me-2"></i>
                                                                )}
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm flex-fill"
                                                                onClick={() => handleBidAction(bid.id, 'reject')}
                                                                disabled={processing === bid.id}
                                                            >
                                                                {processing === bid.id ? (
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                ) : (
                                                                    <i className="fas fa-times me-2"></i>
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