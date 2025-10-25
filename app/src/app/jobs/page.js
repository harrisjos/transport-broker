// @ts-check
/**
 * Jobs listing page - displays all available transport jobs
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'

export default function JobsPage() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        status: 'open',
        page: 1
    })

    useEffect(() => {
        fetchJobs()
    }, [filters])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                status: filters.status,
                page: filters.page.toString(),
                limit: '10'
            })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?${params}`)
            const data = await response.json()

            if (response.ok) {
                setJobs(data.jobs)
            } else {
                setError(data.error || 'Failed to fetch jobs')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(price)
    }

    return (
        <div className="container my-4">
            {/* Page Header */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <h1 className="h2">Transport Jobs</h1>
                    <p className="text-muted">Browse available freight and delivery jobs</p>
                </div>
                <div className="col-md-4 text-md-end">
                    {user && user.role === 'customer' && (
                        <Link href="/jobs/create" className="btn btn-primary">
                            Post New Job
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Filters</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select
                                        id="status"
                                        className="form-select"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                    >
                                        <option value="open">Open Jobs</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
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

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            {!loading && (
                <div className="row">
                    {jobs.length === 0 ? (
                        <div className="col-12">
                            <div className="text-center py-5">
                                <h5>No jobs found</h5>
                                <p className="text-muted">
                                    {filters.status === 'open'
                                        ? "There are no open jobs at the moment. Check back later!"
                                        : `No ${filters.status} jobs found.`
                                    }
                                </p>
                                {user && user.role === 'customer' && (
                                    <Link href="/jobs/create" className="btn btn-primary">
                                        Post the First Job
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <div key={job.id} className="col-lg-6 mb-4">
                                <div className="card job-card h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="card-title">{job.title}</h5>
                                            <span className={`badge ${job.status === 'open' ? 'bg-success' :
                                                    job.status === 'accepted' ? 'bg-warning' :
                                                        job.status === 'in_transit' ? 'bg-info' :
                                                            'bg-secondary'
                                                }`}>
                                                {job.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="card-text text-muted small mb-3">
                                            {job.description.substring(0, 120)}
                                            {job.description.length > 120 && '...'}
                                        </p>

                                        <div className="row g-2 mb-3">
                                            <div className="col-12">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="text-success me-2">📍</i>
                                                    <small><strong>From:</strong> {job.pickup_address}</small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <i className="text-danger me-2">📍</i>
                                                    <small><strong>To:</strong> {job.delivery_address}</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <small className="text-muted">Pickup Date</small>
                                                <div className="fw-semibold">{formatDate(job.pickup_date)}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Delivery Date</small>
                                                <div className="fw-semibold">{formatDate(job.delivery_date)}</div>
                                            </div>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <small className="text-muted">Weight</small>
                                                <div className="fw-semibold">{job.weight_kg} kg</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Pallets</small>
                                                <div className="fw-semibold">{job.pallet_count || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {job.estimated_price && (
                                            <div className="mb-3">
                                                <small className="text-muted">Estimated Price</small>
                                                <div className="h5 text-primary mb-0">{formatPrice(job.estimated_price)}</div>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                By {job.customer_name}
                                            </small>
                                            <Link href={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination would go here */}
        </div>
    )
}