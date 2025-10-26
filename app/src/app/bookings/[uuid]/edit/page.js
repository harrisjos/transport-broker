// @ts-nocheck
/**
 * Edit Booking Page - UUID-based routing for security
 * Allows shippers to edit their booking details
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function EditBookingPage({ params }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchBooking = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/bookings/uuid/${params.uuid}`)
            const data = await response.json()

            if (response.ok) {
                setBooking(data)
            } else {
                setError(data.error || 'Failed to fetch booking details')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }, [params.uuid])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && user.organisationType !== 'shipper' && user.organisationType !== 'both') {
            router.push('/dashboard')
            return
        }

        if (user && params.uuid) {
            fetchBooking()
        }
    }, [user, authLoading, router, params.uuid, fetchBooking])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(`/api/bookings/uuid/${params.uuid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(booking)
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Booking updated successfully!')
                setTimeout(() => {
                    router.push(`/bookings/${params.uuid}`)
                }, 2000)
            } else {
                setError(data.error || 'Failed to update booking')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field, value) => {
        setBooking(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (authLoading || loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading booking details...</p>
            </div>
        )
    }

    if (error && !booking) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <p className="mt-2">
                        <a href="/bookings" className="btn btn-primary">Back to Bookings</a>
                    </p>
                </div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Booking Not Found</h4>
                    <p>The requested booking could not be found.</p>
                    <p className="mt-2">
                        <a href="/bookings" className="btn btn-primary">Back to Bookings</a>
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
                                <a href="/bookings" className="text-decoration-none">My Bookings</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href={`/bookings/${params.uuid}`} className="text-decoration-none">Booking Details</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Edit
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

            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-edit me-2"></i>
                                Edit Booking
                            </h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Origin Details</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Origin Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={booking.origin_name || ''}
                                                onChange={(e) => handleInputChange('origin_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Street Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={booking.origin_street_address || ''}
                                                onChange={(e) => handleInputChange('origin_street_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Suburb</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={booking.origin_suburb || ''}
                                                        onChange={(e) => handleInputChange('origin_suburb', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Postcode</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={booking.origin_postcode || ''}
                                                        onChange={(e) => handleInputChange('origin_postcode', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Destination Details</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Destination Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={booking.destination_name || ''}
                                                onChange={(e) => handleInputChange('destination_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Street Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={booking.destination_street_address || ''}
                                                onChange={(e) => handleInputChange('destination_street_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Suburb</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={booking.destination_suburb || ''}
                                                        onChange={(e) => handleInputChange('destination_suburb', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Postcode</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={booking.destination_postcode || ''}
                                                        onChange={(e) => handleInputChange('destination_postcode', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Cargo Details</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Number of Pallets</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={booking.pallets || ''}
                                                onChange={(e) => handleInputChange('pallets', parseInt(e.target.value))}
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={booking.description || ''}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Budget</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Minimum Budget ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={booking.budget_minimum || ''}
                                                onChange={(e) => handleInputChange('budget_minimum', parseFloat(e.target.value))}
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Maximum Budget ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={booking.budget_maximum || ''}
                                                onChange={(e) => handleInputChange('budget_maximum', parseFloat(e.target.value))}
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Collection Dates</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Earliest Collection</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.collection_date_minimum ? booking.collection_date_minimum.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('collection_date_minimum', e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Preferred Collection</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.collection_date_requested ? booking.collection_date_requested.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('collection_date_requested', e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Latest Collection</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.collection_date_maximum ? booking.collection_date_maximum.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('collection_date_maximum', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Delivery Dates</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Earliest Delivery</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.delivery_date_minimum ? booking.delivery_date_minimum.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('delivery_date_minimum', e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Preferred Delivery</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.delivery_date_requested ? booking.delivery_date_requested.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('delivery_date_requested', e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Latest Delivery</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.delivery_date_maximum ? booking.delivery_date_maximum.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('delivery_date_maximum', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">Special Requirements</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Special Requirements</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={booking.special_requirements || ''}
                                                onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={booking.requires_tailgate || false}
                                                        onChange={(e) => handleInputChange('requires_tailgate', e.target.checked)}
                                                    />
                                                    <label className="form-check-label">
                                                        Requires Tailgate
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={booking.requires_crane || false}
                                                        onChange={(e) => handleInputChange('requires_crane', e.target.checked)}
                                                    />
                                                    <label className="form-check-label">
                                                        Requires Crane
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={booking.requires_forklift || false}
                                                        onChange={(e) => handleInputChange('requires_forklift', e.target.checked)}
                                                    />
                                                    <label className="form-check-label">
                                                        Requires Forklift
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="d-flex justify-content-between">
                                    <a href={`/bookings/${params.uuid}`} className="btn btn-secondary">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Cancel
                                    </a>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}