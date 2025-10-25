// @ts-nocheck
/**
 * Create job page - form for shippers to post new transport jobs
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-jwt'

export default function CreateJobPage() {
    const { user, loading: authLoading, makeAuthenticatedRequest } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pickup_address: '',
        delivery_address: '',
        pickup_date: '',
        delivery_date: '',
        weight_kg: '',
        pallet_count: '',
        estimated_price: ''
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && user.organizationType !== 'shipper' && user.organizationType !== 'both') {
            router.push('/dashboard')
            return
        }
    }, [user, authLoading, router])

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
                            <p className="mt-2">Checking permissions...</p>
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
    if (user.organizationType !== 'shipper' && user.organizationType !== 'both') {
        return (
            <div className="container my-5">
                <div className="alert alert-warning">
                    <h4 className="alert-heading">Access Restricted</h4>
                    <p>Only shipper organizations can create transport jobs.</p>
                    <hr />
                    <p className="mb-0">
                        Your organization type: <strong>{user.organizationType}</strong>
                    </p>
                    <p className="mt-2">
                        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
                    </p>
                </div>
            </div>
        )
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    weight_kg: parseFloat(formData.weight_kg),
                    pallet_count: formData.pallet_count ? parseInt(formData.pallet_count) : 0,
                    estimated_price: formData.estimated_price ? parseFloat(formData.estimated_price) : null
                })
            })

            const data = await response.json()

            if (response.ok) {
                router.push(`/bookings/${data.id}`)
            } else {
                setError(data.error || 'Failed to create booking')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container my-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Page Header */}
                    <div className="mb-4">
                        <h1 className="h2">Post a New Job</h1>
                        <p className="text-muted">Fill in the details below to post your transport job</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Job Form */}
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Basic Information */}
                                <div className="mb-4">
                                    <h5 className="card-title">Job Details</h5>

                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Job Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Furniture delivery from Sydney to Melbourne"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description *</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe your transport requirements, special handling needs, etc."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Pickup & Delivery */}
                                <div className="mb-4">
                                    <h5 className="card-title">Pickup & Delivery</h5>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="pickup_address" className="form-label">Pickup Address *</label>
                                            <textarea
                                                className="form-control"
                                                id="pickup_address"
                                                name="pickup_address"
                                                rows={3}
                                                value={formData.pickup_address}
                                                onChange={handleInputChange}
                                                placeholder="Full pickup address including postcode"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="delivery_address" className="form-label">Delivery Address *</label>
                                            <textarea
                                                className="form-control"
                                                id="delivery_address"
                                                name="delivery_address"
                                                rows={3}
                                                value={formData.delivery_address}
                                                onChange={handleInputChange}
                                                placeholder="Full delivery address including postcode"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="pickup_date" className="form-label">Pickup Date & Time *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="pickup_date"
                                                name="pickup_date"
                                                value={formData.pickup_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="delivery_date" className="form-label">Delivery Date & Time *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="delivery_date"
                                                name="delivery_date"
                                                value={formData.delivery_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cargo Details */}
                                <div className="mb-4">
                                    <h5 className="card-title">Cargo Information</h5>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="weight_kg" className="form-label">Weight (kg) *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="weight_kg"
                                                name="weight_kg"
                                                step="0.1"
                                                min="0.1"
                                                value={formData.weight_kg}
                                                onChange={handleInputChange}
                                                placeholder="100.5"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="pallet_count" className="form-label">Number of Pallets</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="pallet_count"
                                                name="pallet_count"
                                                min="0"
                                                value={formData.pallet_count}
                                                onChange={handleInputChange}
                                                placeholder="4"
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="estimated_price" className="form-label">Estimated Price (AUD)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="estimated_price"
                                                name="estimated_price"
                                                step="0.01"
                                                min="0"
                                                value={formData.estimated_price}
                                                onChange={handleInputChange}
                                                placeholder="1500.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => router.back()}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                Creating Job...
                                            </>
                                        ) : (
                                            'Post Job'
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
