'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth-jwt'

export default function BookingsPage() {
    const { user, loading: authLoading, makeAuthenticatedRequest } = useAuth()
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        limit: 20
    })

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams({
                page: filters.page.toString(),
                limit: filters.limit.toString()
            })

            if (filters.status) {
                params.append('status', filters.status)
            }

            const response = await makeAuthenticatedRequest(`/api/bookings?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch bookings')
            }

            const data = await response.json()
            setBookings(data.bookings || [])
        } catch (err) {
            console.error('Error fetching bookings:', err)
            setError('Failed to load bookings. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [filters, makeAuthenticatedRequest])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchBookings()
        }
    }, [user, authLoading, router, fetchBookings])

    const handleStatusFilter = (status) => {
        setFilters(prev => ({ ...prev, status, page: 1 }))
    }

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

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Bookings</h2>
                        <a href="/bookings/create" className="btn btn-primary">
                            <i className="me-2">➕</i>
                            Create New Booking
                        </a>
                    </div>

                    {/* Filter Bar */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button
                                            className={`btn btn-sm ${filters.status === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handleStatusFilter('')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`btn btn-sm ${filters.status === 'open' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => handleStatusFilter('open')}
                                        >
                                            Open
                                        </button>
                                        <button
                                            className={`btn btn-sm ${filters.status === 'in_bidding' ? 'btn-warning' : 'btn-outline-warning'}`}
                                            onClick={() => handleStatusFilter('in_bidding')}
                                        >
                                            In Bidding
                                        </button>
                                        <button
                                            className={`btn btn-sm ${filters.status === 'awarded' ? 'btn-info' : 'btn-outline-info'}`}
                                            onClick={() => handleStatusFilter('awarded')}
                                        >
                                            Awarded
                                        </button>
                                        <button
                                            className={`btn btn-sm ${filters.status === 'completed' ? 'btn-dark' : 'btn-outline-dark'}`}
                                            onClick={() => handleStatusFilter('completed')}
                                        >
                                            Completed
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-end mt-2 mt-md-0">
                                    <small className="text-muted">
                                        Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Bookings List */}
                    {bookings.length === 0 ? (
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">No bookings found</h5>
                                <p className="text-muted">
                                    {filters.status ?
                                        `No bookings with status "${filters.status}"` :
                                        'You haven\'t created any bookings yet'
                                    }
                                </p>
                                <a href="/bookings/create" className="btn btn-primary">
                                    <i className="me-2">➕</i>
                                    Create Your First Booking
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="col-lg-6 col-xl-4 mb-4">
                                    <div className="card h-100">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h6 className="card-title mb-0">Booking #{booking.id}</h6>
                                            <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <small className="text-muted">Origin</small>
                                                <div className="fw-bold">
                                                    {booking.origin_company || 'N/A'}
                                                </div>
                                                <div className="text-muted small">
                                                    {booking.origin_suburb}, {booking.origin_state} {booking.origin_postcode}
                                                </div>
                                            </div>
                                            <div className="text-center my-2">
                                                <i className="fas fa-arrow-down text-muted"></i>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted">Destination</small>
                                                <div className="fw-bold">
                                                    {booking.destination_company || 'N/A'}
                                                </div>
                                                <div className="text-muted small">
                                                    {booking.destination_suburb}, {booking.destination_state} {booking.destination_postcode}
                                                </div>
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-6">
                                                    <small className="text-muted">Pickup</small>
                                                    <div className="small">{formatDate(booking.pickup_date)}</div>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted">Delivery</small>
                                                    <div className="small">{formatDate(booking.delivery_date)}</div>
                                                </div>
                                            </div>
                                            {booking.description && (
                                                <div className="mb-2">
                                                    <small className="text-muted">Description</small>
                                                    <div className="small text-truncate">
                                                        {booking.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Created {formatDate(booking.created_at)}
                                                </small>
                                                <div className="btn-group btn-group-sm">
                                                    <a href={`/bookings/${booking.uuid}`} className="btn btn-outline-primary btn-sm">
                                                        View
                                                    </a>
                                                    {booking.status === 'open' && (
                                                        <a href={`/bookings/${booking.uuid}/edit`} className="btn btn-outline-secondary btn-sm">
                                                            Edit
                                                        </a>
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
            </div>
        </div>
    )
}