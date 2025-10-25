'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../lib/auth-jwt'
import { useRouter } from 'next/navigation'
import AddressLookup from '../../../components/AddressLookup'
import PalletCalculator from '../../../components/PalletCalculator'

export default function CreateBooking() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [goodsTypes, setGoodsTypes] = useState([])
    const [formData, setFormData] = useState({
        // Origin details
        origin: {
            company: '',
            contact: '',
            phone: '',
            email: '',
            address: '',
            suburb: '',
            state: '',
            postcode: '',
            specialInstructions: ''
        },
        // Destination details
        destination: {
            company: '',
            contact: '',
            phone: '',
            email: '',
            address: '',
            suburb: '',
            state: '',
            postcode: '',
            specialInstructions: ''
        },
        // Shipment details
        shipment: {
            goodsTypeId: '',
            description: '',
            palletDetails: {
                standardPallets: 0,
                nonStandardPallets: [],
                totalWeight: 0,
                totalVolume: 0
            },
            specialHandling: '',
            dangerous: false,
            fragile: false
        },
        // Timing details
        timing: {
            pickupDate: '',
            pickupTimeFrom: '',
            pickupTimeTo: '',
            deliveryDate: '',
            deliveryTimeFrom: '',
            deliveryTimeTo: '',
            flexible: false
        },
        // Budget and terms
        budget: {
            amount: '',
            currency: 'AUD',
            notes: ''
        },
        terms: {
            acceptedTerms: false,
            insuranceRequired: true,
            trackingRequired: true
        }
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!loading && (!user || user.organization_type !== 'shipper')) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        // Load goods types
        loadGoodsTypes()
    }, [])

    const loadGoodsTypes = async () => {
        try {
            const response = await fetch('/api/goods-types')
            if (response.ok) {
                const data = await response.json()
                setGoodsTypes(data)
            }
        } catch (error) {
            console.error('Error loading goods types:', error)
        }
    }

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
        // Clear error when user starts typing
        if (errors[`${section}.${field}`]) {
            setErrors(prev => ({
                ...prev,
                [`${section}.${field}`]: null
            }))
        }
    }

    const handleNestedInputChange = (section, subsection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }))
    }

    const validateStep = (step) => {
        const newErrors = {}

        switch (step) {
            case 1: // Origin validation
                if (!formData.origin.company) newErrors['origin.company'] = 'Company name is required'
                if (!formData.origin.contact) newErrors['origin.contact'] = 'Contact name is required'
                if (!formData.origin.phone) newErrors['origin.phone'] = 'Phone number is required'
                if (!formData.origin.address) newErrors['origin.address'] = 'Address is required'
                if (!formData.origin.postcode) newErrors['origin.postcode'] = 'Postcode is required'
                break
            case 2: // Destination validation
                if (!formData.destination.company) newErrors['destination.company'] = 'Company name is required'
                if (!formData.destination.contact) newErrors['destination.contact'] = 'Contact name is required'
                if (!formData.destination.phone) newErrors['destination.phone'] = 'Phone number is required'
                if (!formData.destination.address) newErrors['destination.address'] = 'Address is required'
                if (!formData.destination.postcode) newErrors['destination.postcode'] = 'Postcode is required'
                break
            case 3: // Shipment validation
                if (!formData.shipment.goodsTypeId) newErrors['shipment.goodsTypeId'] = 'Goods type is required'
                if (!formData.shipment.description) newErrors['shipment.description'] = 'Description is required'
                if (formData.shipment.palletDetails.standardPallets === 0 &&
                    formData.shipment.palletDetails.nonStandardPallets.length === 0) {
                    newErrors['shipment.pallets'] = 'At least one pallet is required'
                }
                break
            case 4: // Timing validation
                if (!formData.timing.pickupDate) newErrors['timing.pickupDate'] = 'Pickup date is required'
                if (!formData.timing.deliveryDate) newErrors['timing.deliveryDate'] = 'Delivery date is required'
                break
            case 5: // Budget validation
                if (!formData.budget.amount) newErrors['budget.amount'] = 'Budget amount is required'
                if (!formData.terms.acceptedTerms) newErrors['terms.acceptedTerms'] = 'You must accept the terms and conditions'
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateStep(5)) return

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const booking = await response.json()
                router.push(`/bookings/${booking.id}`)
            } else {
                const error = await response.json()
                setErrors({ submit: error.message || 'Failed to create booking' })
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!user || user.organization_type !== 'shipper') {
        return null
    }

    const steps = [
        { number: 1, title: 'Origin Details', icon: 'bi-geo-alt' },
        { number: 2, title: 'Destination Details', icon: 'bi-geo-alt-fill' },
        { number: 3, title: 'Shipment Details', icon: 'bi-box-seam' },
        { number: 4, title: 'Timing', icon: 'bi-calendar-event' },
        { number: 5, title: 'Budget & Terms', icon: 'bi-currency-dollar' }
    ]

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">Create New Booking Request</h2>

                    {/* Progress Steps */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                {steps.map((step, index) => (
                                    <div key={step.number} className="d-flex flex-column align-items-center">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-light text-muted'
                                            }`} style={{ width: '50px', height: '50px' }}>
                                            <i className={step.icon}></i>
                                        </div>
                                        <small className={`mt-2 text-center ${currentStep >= step.number ? 'text-primary fw-bold' : 'text-muted'
                                            }`}>
                                            {step.title}
                                        </small>
                                        {index < steps.length - 1 && (
                                            <div className={`position-absolute ${currentStep > step.number ? 'bg-primary' : 'bg-light'
                                                }`} style={{
                                                    height: '2px',
                                                    width: '100px',
                                                    top: '25px',
                                                    left: '75px',
                                                    zIndex: -1
                                                }}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            <div className="card-body">
                                {/* Step 1: Origin Details */}
                                {currentStep === 1 && (
                                    <div>
                                        <h4 className="card-title mb-4">
                                            <i className="bi-geo-alt me-2"></i>
                                            Pickup Location Details
                                        </h4>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Company Name *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors['origin.company'] ? 'is-invalid' : ''}`}
                                                    value={formData.origin.company}
                                                    onChange={(e) => handleInputChange('origin', 'company', e.target.value)}
                                                    placeholder="Enter company name"
                                                />
                                                {errors['origin.company'] && (
                                                    <div className="invalid-feedback">{errors['origin.company']}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Contact Person *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors['origin.contact'] ? 'is-invalid' : ''}`}
                                                    value={formData.origin.contact}
                                                    onChange={(e) => handleInputChange('origin', 'contact', e.target.value)}
                                                    placeholder="Enter contact name"
                                                />
                                                {errors['origin.contact'] && (
                                                    <div className="invalid-feedback">{errors['origin.contact']}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors['origin.phone'] ? 'is-invalid' : ''}`}
                                                    value={formData.origin.phone}
                                                    onChange={(e) => handleInputChange('origin', 'phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                />
                                                {errors['origin.phone'] && (
                                                    <div className="invalid-feedback">{errors['origin.phone']}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.origin.email}
                                                    onChange={(e) => handleInputChange('origin', 'email', e.target.value)}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>

                                        <AddressLookup
                                            label="Pickup Address"
                                            address={formData.origin}
                                            onAddressChange={(addressData) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    origin: { ...prev.origin, ...addressData }
                                                }))
                                            }}
                                            errors={errors}
                                            prefix="origin"
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Special Instructions</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={formData.origin.specialInstructions}
                                                onChange={(e) => handleInputChange('origin', 'specialInstructions', e.target.value)}
                                                placeholder="Any special pickup instructions..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Destination Details */}
                                {currentStep === 2 && (
                                    <div>
                                        <h4 className="card-title mb-4">
                                            <i className="bi-geo-alt-fill me-2"></i>
                                            Delivery Location Details
                                        </h4>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Company Name *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors['destination.company'] ? 'is-invalid' : ''}`}
                                                    value={formData.destination.company}
                                                    onChange={(e) => handleInputChange('destination', 'company', e.target.value)}
                                                    placeholder="Enter company name"
                                                />
                                                {errors['destination.company'] && (
                                                    <div className="invalid-feedback">{errors['destination.company']}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Contact Person *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors['destination.contact'] ? 'is-invalid' : ''}`}
                                                    value={formData.destination.contact}
                                                    onChange={(e) => handleInputChange('destination', 'contact', e.target.value)}
                                                    placeholder="Enter contact name"
                                                />
                                                {errors['destination.contact'] && (
                                                    <div className="invalid-feedback">{errors['destination.contact']}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors['destination.phone'] ? 'is-invalid' : ''}`}
                                                    value={formData.destination.phone}
                                                    onChange={(e) => handleInputChange('destination', 'phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                />
                                                {errors['destination.phone'] && (
                                                    <div className="invalid-feedback">{errors['destination.phone']}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.destination.email}
                                                    onChange={(e) => handleInputChange('destination', 'email', e.target.value)}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>

                                        <AddressLookup
                                            label="Delivery Address"
                                            address={formData.destination}
                                            onAddressChange={(addressData) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    destination: { ...prev.destination, ...addressData }
                                                }))
                                            }}
                                            errors={errors}
                                            prefix="destination"
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Special Instructions</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={formData.destination.specialInstructions}
                                                onChange={(e) => handleInputChange('destination', 'specialInstructions', e.target.value)}
                                                placeholder="Any special delivery instructions..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Shipment Details */}
                                {currentStep === 3 && (
                                    <div>
                                        <h4 className="card-title mb-4">
                                            <i className="bi-box-seam me-2"></i>
                                            Shipment Details
                                        </h4>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Goods Type *</label>
                                                <select
                                                    className={`form-select ${errors['shipment.goodsTypeId'] ? 'is-invalid' : ''}`}
                                                    value={formData.shipment.goodsTypeId}
                                                    onChange={(e) => handleInputChange('shipment', 'goodsTypeId', e.target.value)}
                                                >
                                                    <option value="">Select goods type</option>
                                                    {goodsTypes.map(type => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors['shipment.goodsTypeId'] && (
                                                    <div className="invalid-feedback">{errors['shipment.goodsTypeId']}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Description *</label>
                                            <textarea
                                                className={`form-control ${errors['shipment.description'] ? 'is-invalid' : ''}`}
                                                rows="3"
                                                value={formData.shipment.description}
                                                onChange={(e) => handleInputChange('shipment', 'description', e.target.value)}
                                                placeholder="Describe what you're shipping..."
                                            />
                                            {errors['shipment.description'] && (
                                                <div className="invalid-feedback">{errors['shipment.description']}</div>
                                            )}
                                        </div>

                                        <PalletCalculator
                                            palletDetails={formData.shipment.palletDetails}
                                            onPalletChange={(palletData) => {
                                                handleNestedInputChange('shipment', 'palletDetails', 'standardPallets', palletData.standardPallets)
                                                handleNestedInputChange('shipment', 'palletDetails', 'nonStandardPallets', palletData.nonStandardPallets)
                                                handleNestedInputChange('shipment', 'palletDetails', 'totalWeight', palletData.totalWeight)
                                                handleNestedInputChange('shipment', 'palletDetails', 'totalVolume', palletData.totalVolume)
                                            }}
                                            errors={errors}
                                        />

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={formData.shipment.dangerous}
                                                        onChange={(e) => handleInputChange('shipment', 'dangerous', e.target.checked)}
                                                        id="dangerousGoods"
                                                    />
                                                    <label className="form-check-label" htmlFor="dangerousGoods">
                                                        Dangerous Goods
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={formData.shipment.fragile}
                                                        onChange={(e) => handleInputChange('shipment', 'fragile', e.target.checked)}
                                                        id="fragileGoods"
                                                    />
                                                    <label className="form-check-label" htmlFor="fragileGoods">
                                                        Fragile Items
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Special Handling Requirements</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={formData.shipment.specialHandling}
                                                onChange={(e) => handleInputChange('shipment', 'specialHandling', e.target.value)}
                                                placeholder="Any special handling requirements..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Timing */}
                                {currentStep === 4 && (
                                    <div>
                                        <h4 className="card-title mb-4">
                                            <i className="bi-calendar-event me-2"></i>
                                            Pickup & Delivery Timing
                                        </h4>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <h5 className="mb-3">Pickup Details</h5>

                                                <div className="mb-3">
                                                    <label className="form-label">Pickup Date *</label>
                                                    <input
                                                        type="date"
                                                        className={`form-control ${errors['timing.pickupDate'] ? 'is-invalid' : ''}`}
                                                        value={formData.timing.pickupDate}
                                                        onChange={(e) => handleInputChange('timing', 'pickupDate', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                    {errors['timing.pickupDate'] && (
                                                        <div className="invalid-feedback">{errors['timing.pickupDate']}</div>
                                                    )}
                                                </div>

                                                <div className="row">
                                                    <div className="col-6 mb-3">
                                                        <label className="form-label">From Time</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={formData.timing.pickupTimeFrom}
                                                            onChange={(e) => handleInputChange('timing', 'pickupTimeFrom', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-6 mb-3">
                                                        <label className="form-label">To Time</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={formData.timing.pickupTimeTo}
                                                            onChange={(e) => handleInputChange('timing', 'pickupTimeTo', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <h5 className="mb-3">Delivery Details</h5>

                                                <div className="mb-3">
                                                    <label className="form-label">Delivery Date *</label>
                                                    <input
                                                        type="date"
                                                        className={`form-control ${errors['timing.deliveryDate'] ? 'is-invalid' : ''}`}
                                                        value={formData.timing.deliveryDate}
                                                        onChange={(e) => handleInputChange('timing', 'deliveryDate', e.target.value)}
                                                        min={formData.timing.pickupDate || new Date().toISOString().split('T')[0]}
                                                    />
                                                    {errors['timing.deliveryDate'] && (
                                                        <div className="invalid-feedback">{errors['timing.deliveryDate']}</div>
                                                    )}
                                                </div>

                                                <div className="row">
                                                    <div className="col-6 mb-3">
                                                        <label className="form-label">From Time</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={formData.timing.deliveryTimeFrom}
                                                            onChange={(e) => handleInputChange('timing', 'deliveryTimeFrom', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-6 mb-3">
                                                        <label className="form-label">To Time</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={formData.timing.deliveryTimeTo}
                                                            onChange={(e) => handleInputChange('timing', 'deliveryTimeTo', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.timing.flexible}
                                                    onChange={(e) => handleInputChange('timing', 'flexible', e.target.checked)}
                                                    id="flexibleTiming"
                                                />
                                                <label className="form-check-label" htmlFor="flexibleTiming">
                                                    I'm flexible with pickup/delivery times
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Budget & Terms */}
                                {currentStep === 5 && (
                                    <div>
                                        <h4 className="card-title mb-4">
                                            <i className="bi-currency-dollar me-2"></i>
                                            Budget & Terms
                                        </h4>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Budget Amount (AUD) *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">$</span>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${errors['budget.amount'] ? 'is-invalid' : ''}`}
                                                        value={formData.budget.amount}
                                                        onChange={(e) => handleInputChange('budget', 'amount', e.target.value)}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    {errors['budget.amount'] && (
                                                        <div className="invalid-feedback">{errors['budget.amount']}</div>
                                                    )}
                                                </div>
                                                <small className="form-text text-muted">
                                                    This amount will not be visible to carriers
                                                </small>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Budget Notes</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={formData.budget.notes}
                                                onChange={(e) => handleInputChange('budget', 'notes', e.target.value)}
                                                placeholder="Any additional budget considerations..."
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.terms.insuranceRequired}
                                                    onChange={(e) => handleInputChange('terms', 'insuranceRequired', e.target.checked)}
                                                    id="insuranceRequired"
                                                />
                                                <label className="form-check-label" htmlFor="insuranceRequired">
                                                    Insurance required
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.terms.trackingRequired}
                                                    onChange={(e) => handleInputChange('terms', 'trackingRequired', e.target.checked)}
                                                    id="trackingRequired"
                                                />
                                                <label className="form-check-label" htmlFor="trackingRequired">
                                                    Real-time tracking required
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    className={`form-check-input ${errors['terms.acceptedTerms'] ? 'is-invalid' : ''}`}
                                                    type="checkbox"
                                                    checked={formData.terms.acceptedTerms}
                                                    onChange={(e) => handleInputChange('terms', 'acceptedTerms', e.target.checked)}
                                                    id="acceptedTerms"
                                                />
                                                <label className="form-check-label" htmlFor="acceptedTerms">
                                                    I accept the <a href="/terms" target="_blank">Terms and Conditions</a> *
                                                </label>
                                                {errors['terms.acceptedTerms'] && (
                                                    <div className="invalid-feedback d-block">{errors['terms.acceptedTerms']}</div>
                                                )}
                                            </div>
                                        </div>

                                        {errors.submit && (
                                            <div className="alert alert-danger">{errors.submit}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                    >
                                        <i className="bi-chevron-left me-2"></i>
                                        Previous
                                    </button>

                                    {currentStep < 5 ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={nextStep}
                                        >
                                            Next
                                            <i className="bi-chevron-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi-check-circle me-2"></i>
                                                    Create Booking
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
