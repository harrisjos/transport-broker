'use client'

import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import Image from 'next/image'
import { BRANDING } from '@/config/branding'

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSuccess(true)
                setMessage('Password reset instructions have been sent to your email address.')
                toast.success('Password reset instructions sent!', { position: 'top-right' })
            } else {
                setMessage(data.message || 'Failed to send reset email')
                toast.error(data.message || 'Failed to send reset email', { position: 'top-right' })
            }
        } catch (error) {
            console.error('Reset password error:', error)
            setMessage('Network error occurred')
            toast.error('Network error occurred', { position: 'top-right' })
        } finally {
            setLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <>
                <ToastContainer />
                <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-6 col-lg-4">
                                <div className="card shadow">
                                    <div className="card-body p-5">
                                        <div className="text-center mb-4">
                                            <Image
                                                src={BRANDING.assets.logo}
                                                alt={BRANDING.appName}
                                                className="mb-3"
                                                width={180}
                                                height={60}
                                                style={{ height: '60px', width: 'auto' }}
                                                priority
                                            />
                                            <h2 className="h4 text-success mb-0">Email Sent!</h2>
                                        </div>
                                        <div className="text-center mb-4">
                                            <p className="text-muted mb-4">
                                                We&apos;ve sent password reset instructions to your email address.
                                                Please check your inbox and follow the instructions.
                                            </p>
                                            <p className="text-muted small">
                                                Didn&apos;t receive the email? Check your spam folder or try again.
                                            </p>
                                        </div>
                                        <div className="d-grid gap-2">
                                            <Link href="/auth/login" className="btn btn-primary">
                                                Return to Login
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    setIsSuccess(false)
                                                    setEmail('')
                                                    setMessage('')
                                                }}
                                            >
                                                Send Another Email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <ToastContainer />
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="card shadow">
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <Image
                                            src={BRANDING.assets.logo}
                                            alt={BRANDING.appName}
                                            className="mb-3"
                                            width={180}
                                            height={60}
                                            style={{ height: '60px', width: 'auto' }}
                                            priority
                                        />
                                        <h1 className="h4 mb-0">Reset Password</h1>
                                        <p className="text-muted mt-2">
                                            Enter your email address and we&apos;ll send you instructions to reset your password.
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        {message && (
                                            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3`}>
                                                {message}
                                            </div>
                                        )}
                                        <div className="d-grid mb-3">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send Reset Instructions'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="text-center">
                                        <Link href="/auth/login" className="text-decoration-none">
                                            ← Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}