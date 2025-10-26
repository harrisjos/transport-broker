// @ts-nocheck
/**
 * Bid placement page for carriers - allows carriers to place bids on specific jobs
 */
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'
import { getPlatformChargeBreakdown } from '../../../lib/platform-charges'

export default function BidPage({ params }) {
    const { user, loading: authLoading, makeAuthenticatedRequest } = useAuth()
    const router = useRouter()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [platformCharges, setPlatformCharges] = useState(null)

    const [bidData, setBidData] = useState({
        amount: '',
        expiry_date: '',
        pickup_date: '',
        delivery_date: '',
        notes: '',
        terms_and_conditions: ''
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

        if (user && params.id) {
            fetchJobDetails()
        }
    }, [user, authLoading, router, params.id])

    const fetchJobDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/bookings/${params.id}`)
            const data = await response.json()

            if (response.ok) {
                setJob(data)
                // Pre-populate with job dates if available
                setBidData(prev => ({
                    ...prev,
                    pickup_date: data.pickup_date ? data.pickup_date.split('T')[0] : '',
                    delivery_date: data.delivery_date ? data.delivery_date.split('T')[0] : ''
                }))
            } else {
                setError(data.error || 'Failed to fetch job details')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setBidData(prev => ({
            ...prev,
            [name]: value
        }))

        // Calculate platform charges when amount changes
        if (name === 'amount' && value) {
            const chargeBreakdown = getPlatformChargeBreakdown(value)
            setPlatformCharges(chargeBreakdown)
        } else if (name === 'amount' && !value) {
            setPlatformCharges(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const response = await makeAuthenticatedRequest(`${API_BASE}/api/jobs/${params.id}/bids`, {
                method: 'POST',
                body: JSON.stringify({
                    price: parseFloat(bidData.amount),
                    message: bidData.notes
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Bid submitted successfully!')
                setTimeout(() => {
                    router.push('/jobs')
                }, 2000)
            } else {
                setError(data.error || 'Failed to submit bid')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setSubmitting(false)
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
                            <p className="mt-2">Loading job details...</p>
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
    if (user.organizationType !== 'carrier' && user.organizationType !== 'both') {
        return (
            <div className="container my-5">
                <div className="alert alert-warning">
                    <h4 className="alert-heading">Access Restricted</h4>
                    <p>Only carrier organizations can place bids on jobs.</p>
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
                    <p>The requested job could not be found or is no longer available.</p>
                    <p className="mt-2">
                        <a href="/jobs" className="btn btn-primary">Browse Available Jobs</a>
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
                                <a href="/jobs" className="text-decoration-none">Available Jobs</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Place Bid - Booking #{params.id}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="row">
                {/* Job Details Column */}
                <div className="col-lg-5 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Job Details</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <h6 className="text-primary">Booking #{job.id}</h6>
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
                                <div className="mb-3">
                                    <small className="text-muted">Goods Type:</small>
                                    <div className="fw-bold">{job.goods_type_name}</div>
                                </div>
                            )}

                            {/* Route */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-circle text-success me-2" style={{ fontSize: '8px' }}></i>
                                    <small className="text-muted">From:</small>
                                </div>
                                <div className="ms-3 mb-3">
                                    <strong>{job.origin_suburb}, {job.origin_state} {job.origin_postcode}</strong>
                                </div>

                                <div className="d-flex align-items-center mb-2">
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

                            {/* Requested Pickup Date */}
                            <div className="mb-3">
                                <small className="text-muted">Requested Pickup Date:</small>
                                <div className="fw-bold">{formatDate(job.pickup_date)}</div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div className="mb-3">
                                    <small className="text-muted">Description:</small>
                                    <p className="small mb-0">{job.description}</p>
                                </div>
                            )}

                            <div className="mt-3">
                                <small className="text-muted">Posted: {formatDate(job.created_at)}</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bid Form Column */}
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Place Your Bid</h5>
                        </div>
                        <div className="card-body">
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

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="amount" className="form-label">
                                            Bid Amount (AUD) <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="amount"
                                                name="amount"
                                                value={bidData.amount}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="expiry_date" className="form-label">
                                            Bid Expiry Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="expiry_date"
                                            name="expiry_date"
                                            value={bidData.expiry_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Platform Charges Breakdown */}
                                {platformCharges && platformCharges.isValid && (
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="card bg-light">
                                                <div className="card-header">
                                                    <h6 className="card-title mb-0">
                                                        <i className="bi bi-calculator me-2"></i>
                                                        Payment Breakdown
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="text-muted small">Your Bid Amount</div>
                                                            <div className="h5 text-primary">{platformCharges.breakdown.formattedBidAmount}</div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="text-muted small">Platform Charge ({platformCharges.breakdown.platformChargePercentage}%)</div>
                                                            <div className="h6 text-warning">-{platformCharges.breakdown.formattedPlatformCharge}</div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="text-muted small">You Will Receive</div>
                                                            <div className="h4 text-success">{platformCharges.breakdown.formattedCarrierNetAmount}</div>
                                                        </div>
                                                    </div>
                                                    <hr className="my-2" />
                                                    <small className="text-muted">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        Platform charge: 5% with minimum $25 and maximum $100
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {platformCharges && !platformCharges.isValid && (
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="alert alert-warning">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                {platformCharges.error}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pickup_date" className="form-label">
                                            Proposed Pickup Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="pickup_date"
                                            name="pickup_date"
                                            value={bidData.pickup_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="delivery_date" className="form-label">
                                            Proposed Delivery Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="delivery_date"
                                            name="delivery_date"
                                            value={bidData.delivery_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="notes" className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        id="notes"
                                        name="notes"
                                        rows="3"
                                        value={bidData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any additional information or special requirements..."
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="terms_and_conditions" className="form-label">
                                        Terms and Conditions
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="terms_and_conditions"
                                        name="terms_and_conditions"
                                        rows="4"
                                        value={bidData.terms_and_conditions}
                                        onChange={handleInputChange}
                                        placeholder="Specify your terms, insurance coverage, liability conditions, etc..."
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => router.push('/jobs')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Submitting Bid...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-handshake me-2"></i>
                                                Place Bid
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}