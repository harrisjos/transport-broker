'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function BookingDetailsPage({ params }) {
    const { user, loading: authLoading, makeAuthenticatedRequest } = useAuth()
    const router = useRouter()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchBookingDetails = useCallback(async () => {
        try {
            setLoading(true)
            setError('')

            // Fetch booking details using UUID
            const response = await makeAuthenticatedRequest(`/api/bookings/uuid/${params.uuid}`)

            if (response.ok) {
                const bookingData = await response.json()
                setBooking(bookingData)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to fetch booking details')
            }
        } catch (err) {
            console.error('Error fetching booking:', err)
            setError('Failed to load booking details')
        } finally {
            setLoading(false)
        }
    }, [makeAuthenticatedRequest, params.uuid])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && params.uuid) {
            fetchBookingDetails()
        }
    }, [user, authLoading, router, params.uuid, fetchBookingDetails])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'open': return 'bg-success'
            case 'in_bidding': return 'bg-warning'
            case 'awarded': return 'bg-info'
            case 'in_transit': return 'bg-primary'
            case 'delivered': return 'bg-secondary'
            case 'completed': return 'bg-dark'
            case 'cancelled': return 'bg-danger'
            default: return 'bg-light text-dark'
        }
    }

    if (authLoading || loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <a href="/bookings" className="btn btn-primary">Back to Bookings</a>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Booking not found</div>
                <a href="/bookings" className="btn btn-primary">Back to Bookings</a>
            </div>
        )
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2>Booking Details</h2>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a href="/dashboard" className="text-decoration-none">Dashboard</a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a href="/bookings" className="text-decoration-none">Bookings</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Booking #{booking.id}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div>
                            <span className={`badge ${getStatusBadgeClass(booking.status)} me-2`}>
                                {booking.status?.replace('_', ' ').toUpperCase()}
                            </span>
                            <a href={`/bookings/${params.uuid}/bids`} className="btn btn-warning me-2">
                                View Bids
                            </a>
                            <a href="/bookings" className="btn btn-outline-secondary">
                                Back to Bookings
                            </a>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5>Route Information</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Origin</h6>
                                            <p className="mb-1"><strong>{booking.origin_name}</strong></p>
                                            <p className="text-muted mb-0">
                                                {booking.origin_street_address}
                                                {booking.origin_building && `, ${booking.origin_building}`}
                                            </p>
                                            <p className="text-muted">
                                                {booking.origin_suburb}, {booking.origin_state} {booking.origin_postcode}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Destination</h6>
                                            <p className="mb-1"><strong>{booking.destination_name}</strong></p>
                                            <p className="text-muted mb-0">
                                                {booking.destination_street_address}
                                                {booking.destination_building && `, ${booking.destination_building}`}
                                            </p>
                                            <p className="text-muted">
                                                {booking.destination_suburb}, {booking.destination_state} {booking.destination_postcode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5>Schedule</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Collection Dates</h6>
                                            <p className="mb-1">
                                                <strong>Preferred:</strong> {formatDate(booking.collection_date_requested)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Earliest:</strong> {formatDate(booking.collection_date_minimum)}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Latest:</strong> {formatDate(booking.collection_date_maximum)}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Delivery Dates</h6>
                                            <p className="mb-1">
                                                <strong>Preferred:</strong> {formatDate(booking.delivery_date_requested)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Earliest:</strong> {formatDate(booking.delivery_date_minimum)}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Latest:</strong> {formatDate(booking.delivery_date_maximum)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {booking.description && (
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5>Description</h5>
                                    </div>
                                    <div className="card-body">
                                        <p>{booking.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-md-4">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5>Budget</h5>
                                </div>
                                <div className="card-body">
                                    {booking.budget_minimum && booking.budget_maximum ? (
                                        <p className="h5 text-success">
                                            ${booking.budget_minimum} - ${booking.budget_maximum}
                                        </p>
                                    ) : booking.budget_maximum ? (
                                        <p className="h5 text-success">Up to ${booking.budget_maximum}</p>
                                    ) : (
                                        <p className="text-muted">Budget not specified</p>
                                    )}
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5>Requirements</h5>
                                </div>
                                <div className="card-body">
                                    {booking.requires_tailgate && (
                                        <span className="badge bg-info me-1 mb-1">Tailgate Required</span>
                                    )}
                                    {booking.requires_crane && (
                                        <span className="badge bg-info me-1 mb-1">Crane Required</span>
                                    )}
                                    {booking.requires_forklift && (
                                        <span className="badge bg-info me-1 mb-1">Forklift Required</span>
                                    )}
                                    {!booking.requires_tailgate && !booking.requires_crane && !booking.requires_forklift && (
                                        <p className="text-muted">No special requirements</p>
                                    )}
                                    {booking.special_requirements && (
                                        <div className="mt-2">
                                            <small className="text-muted d-block">Special Requirements:</small>
                                            <p className="mb-0">{booking.special_requirements}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h5>Booking Info</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-1">
                                        <strong>ID:</strong> {booking.id}
                                    </p>
                                    <p className="mb-1">
                                        <strong>UUID:</strong> <small>{booking.uuid}</small>
                                    </p>
                                    <p className="mb-1">
                                        <strong>Created:</strong> {formatDate(booking.created_at)}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Status:</strong>
                                        <span className={`badge ${getStatusBadgeClass(booking.status)} ms-1`}>
                                            {booking.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}