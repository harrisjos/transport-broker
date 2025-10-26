'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchBookings()
        }
    }, [user, authLoading, router])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch('/api/bookings')
            
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
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
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

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {bookings.length === 0 ? (
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <h5 className="text-muted">No bookings found</h5>
                                <p className="text-muted">You haven't created any bookings yet</p>
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
                                        <div className="card-header">
                                            <h6 className="card-title mb-0">Booking #{booking.id}</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <strong>From:</strong> {booking.origin_company || 'N/A'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>To:</strong> {booking.destination_company || 'N/A'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Status:</strong> {booking.status}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Created:</strong> {formatDate(booking.created_at)}
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