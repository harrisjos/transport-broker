'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// import { useAuth } from '../../../lib/auth-jwt'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        organisationName: '',
        organisationType: 'shipper',
        organisationDetails: {
            tradingName: '',
            abn: '',
            streetAddress: '',
            suburb: '',
            postcode: '',
            state: 'NSW',
            phone: '',
            email: ''
        }
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    // const { login } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name.startsWith('org.')) {
            const orgField = name.replace('org.', '')
            setFormData(prev => ({
                ...prev,
                organisationDetails: {
                    ...prev.organisationDetails,
                    [orgField]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match', { position: 'top-right' })
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long', { position: 'top-right' })
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phone: formData.phone,
                    organisationName: formData.organisationName,
                    organisationType: formData.organisationType,
                    organisationDetails: formData.organisationDetails
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Registration failed', { position: 'top-right' })
                throw new Error(data.error || 'Registration failed')
            }

            // Auto-login after successful registration
            localStorage.setItem('authToken', data.token)

            toast.success('Registration successful!', { position: 'top-right' })

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 1200)

        } catch (err) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="h3 mb-3">Create Account</h2>
                                <p className="text-muted">Join Transport Broker to connect with carriers and customers</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Personal Information */}
                                <div className="mb-4">
                                    <h5 className="text-primary mb-3">Personal Information</h5>

                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="password" className="form-label">Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                minLength={8}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Organization Information */}
                                <div className="mb-4">
                                    <h5 className="text-primary mb-3">Organization Information</h5>

                                    <div className="mb-3">
                                        <label htmlFor="organisationName" className="form-label">Organisation Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="organisationName"
                                            name="organisationName"
                                            value={formData.organisationName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="organisationType" className="form-label">Organisation Type *</label>
                                        <select
                                            className="form-select"
                                            id="organisationType"
                                            name="organisationType"
                                            value={formData.organisationType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="shipper">Shipper (Send Goods)</option>
                                            <option value="carrier">Carrier (Transport Goods)</option>
                                            <option value="both">Both Shipper & Carrier</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="org.tradingName" className="form-label">Trading Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="org.tradingName"
                                            name="org.tradingName"
                                            value={formData.organizationDetails.tradingName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="org.abn" className="form-label">ABN</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="org.abn"
                                                name="org.abn"
                                                value={formData.organizationDetails.abn}
                                                onChange={handleChange}
                                                placeholder="12 345 678 901"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="org.state" className="form-label">State</label>
                                            <select
                                                className="form-select"
                                                id="org.state"
                                                name="org.state"
                                                value={formData.organizationDetails.state}
                                                onChange={handleChange}
                                            >
                                                <option value="NSW">New South Wales</option>
                                                <option value="VIC">Victoria</option>
                                                <option value="QLD">Queensland</option>
                                                <option value="WA">Western Australia</option>
                                                <option value="SA">South Australia</option>
                                                <option value="TAS">Tasmania</option>
                                                <option value="NT">Northern Territory</option>
                                                <option value="ACT">Australian Capital Territory</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Already have an account? {' '}
                                    <Link href="/auth/login" className="text-decoration-none">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
