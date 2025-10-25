'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-jwt'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const { user, loading: authLoading, getCurrentUser } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        organization: {
            name: '',
            abn: '',
            address: '',
            organizationType: ''
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            loadProfile()
        }
    }, [user, authLoading, router])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const userData = await response.json()
                setProfile({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    organization: {
                        name: userData.organization?.name || '',
                        abn: userData.organization?.abn || '',
                        address: userData.organization?.address || '',
                        organizationType: userData.organization?.organizationType || ''
                    }
                })
            } else {
                setError('Failed to load profile')
            }
        } catch (error) {
            console.error('Failed to load profile:', error)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile)
            })

            if (response.ok) {
                setSuccess('Profile updated successfully')
                setEditMode(false)
                await getCurrentUser() // Refresh user data in auth context
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setEditMode(false)
        setError('')
        setSuccess('')
        loadProfile() // Reload original data
    }

    if (authLoading || loading) {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Profile</h4>
                            {!editMode && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setEditMode(true)}
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    Edit Profile
                                </button>
                            )}
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

                            <form onSubmit={handleSave}>
                                {/* Personal Information */}
                                <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="name" className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            value={profile.name}
                                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                            disabled={!editMode}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                            disabled={!editMode}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            value={profile.phone}
                                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                            disabled={!editMode}
                                        />
                                    </div>
                                </div>

                                {/* Organization Information */}
                                <h5 className="border-bottom pb-2 mb-3">Organization Information</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="orgName" className="form-label">Organization Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="orgName"
                                            value={profile.organization.name}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                organization: { ...prev.organization, name: e.target.value }
                                            }))}
                                            disabled={!editMode}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="orgType" className="form-label">Organization Type</label>
                                        <select
                                            className="form-select"
                                            id="orgType"
                                            value={profile.organization.organizationType}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                organization: { ...prev.organization, organizationType: e.target.value }
                                            }))}
                                            disabled={!editMode}
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="shipper">Shipper</option>
                                            <option value="carrier">Carrier</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="abn" className="form-label">ABN</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="abn"
                                            value={profile.organization.abn}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                organization: { ...prev.organization, abn: e.target.value }
                                            }))}
                                            disabled={!editMode}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-12">
                                        <label htmlFor="address" className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            id="address"
                                            rows="3"
                                            value={profile.organization.address}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                organization: { ...prev.organization, address: e.target.value }
                                            }))}
                                            disabled={!editMode}
                                        />
                                    </div>
                                </div>

                                {editMode && (
                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
