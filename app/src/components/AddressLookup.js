'use client'

import { useState, useEffect, useRef } from 'react'

export default function AddressLookup({
    label,
    address,
    onAddressChange,
    errors,
    prefix,
    required = true
}) {
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const autocompleteRef = useRef(null)
    const addressInputRef = useRef(null)
    const searchTimeoutRef = useRef(null)

    useEffect(() => {
        // Load Google Places API if not already loaded
        if (!window.google) {
            loadGooglePlacesAPI()
        } else {
            setIsGoogleLoaded(true)
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        // Initialize Google Places Autocomplete when API is loaded
        if (isGoogleLoaded && addressInputRef.current && !autocompleteRef.current) {
            initializeAutocomplete()
        }
    }, [isGoogleLoaded])

    const loadGooglePlacesAPI = () => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCHHmQVarI_BLKj3uBfS8VJvEzObD9lbXM&libraries=places&callback=initGooglePlaces`
        script.async = true
        script.defer = true

        window.initGooglePlaces = () => {
            setIsGoogleLoaded(true)
        }

        document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
        const autocomplete = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            {
                componentRestrictions: { country: 'au' }, // Restrict to Australia
                fields: ['address_components', 'formatted_address', 'geometry'],
                types: ['address']
            }
        )

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.address_components) {
                parseGooglePlaceResult(place)
            }
        })

        autocompleteRef.current = autocomplete
    }

    const parseGooglePlaceResult = (place) => {
        const addressComponents = place.address_components
        const addressData = {
            address: place.formatted_address,
            suburb: '',
            state: '',
            postcode: '',
            latitude: place.geometry?.location?.lat() || null,
            longitude: place.geometry?.location?.lng() || null
        }

        // Parse address components
        addressComponents.forEach(component => {
            const types = component.types

            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                addressData.suburb = component.long_name
            } else if (types.includes('administrative_area_level_1')) {
                addressData.state = component.short_name
            } else if (types.includes('postal_code')) {
                addressData.postcode = component.long_name
            }
        })

        onAddressChange(addressData)
    }

    const handleAddressSearch = async (query) => {
        if (query.length < 3) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        setIsSearching(true)

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Debounce search
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                // First try our local postcode database
                const postcodeResponse = await fetch(`/api/postcodes/search?q=${encodeURIComponent(query)}`)
                if (postcodeResponse.ok) {
                    const postcodeResults = await postcodeResponse.json()
                    if (postcodeResults.length > 0) {
                        setSuggestions(postcodeResults.map(result => ({
                            id: `postcode_${result.postcode}`,
                            display: `${result.suburb}, ${result.state} ${result.postcode}`,
                            address: result.suburb,
                            suburb: result.suburb,
                            state: result.state,
                            postcode: result.postcode,
                            type: 'postcode'
                        })))
                        setShowSuggestions(true)
                        setIsSearching(false)
                        return
                    }
                }

                // Fallback to Google Places if available
                if (isGoogleLoaded && window.google) {
                    const service = new window.google.maps.places.AutocompleteService()
                    service.getPlacePredictions({
                        input: query,
                        componentRestrictions: { country: 'au' },
                        types: ['address']
                    }, (predictions, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                            setSuggestions(predictions.map(prediction => ({
                                id: prediction.place_id,
                                display: prediction.description,
                                type: 'google'
                            })))
                            setShowSuggestions(true)
                        } else {
                            setSuggestions([])
                            setShowSuggestions(false)
                        }
                        setIsSearching(false)
                    })
                } else {
                    setIsSearching(false)
                }
            } catch (error) {
                console.error('Address search error:', error)
                setIsSearching(false)
            }
        }, 300)
    }

    const handleSuggestionClick = async (suggestion) => {
        if (suggestion.type === 'postcode') {
            // Use postcode data directly
            onAddressChange({
                address: suggestion.address,
                suburb: suggestion.suburb,
                state: suggestion.state,
                postcode: suggestion.postcode
            })

            // Update input value
            if (addressInputRef.current) {
                addressInputRef.current.value = suggestion.display
            }
        } else if (suggestion.type === 'google' && isGoogleLoaded) {
            // Get place details from Google
            const service = new window.google.maps.places.PlacesService(document.createElement('div'))
            service.getDetails({
                placeId: suggestion.id,
                fields: ['address_components', 'formatted_address', 'geometry']
            }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    parseGooglePlaceResult(place)
                    if (addressInputRef.current) {
                        addressInputRef.current.value = place.formatted_address
                    }
                }
            })
        }

        setShowSuggestions(false)
        setSuggestions([])
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        onAddressChange({ address: value })

        if (value.trim()) {
            handleAddressSearch(value)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    const handlePostcodeChange = async (e) => {
        const postcode = e.target.value
        onAddressChange({ postcode })

        // Auto-populate suburb and state from postcode
        if (postcode.length === 4) {
            try {
                const response = await fetch(`/api/postcodes/lookup/${postcode}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.length > 0) {
                        // If multiple suburbs for this postcode, use the first one
                        const postcodeData = data[0]
                        onAddressChange({
                            suburb: postcodeData.suburb,
                            state: postcodeData.state,
                            postcode: postcodeData.postcode
                        })
                    }
                }
            } catch (error) {
                console.error('Postcode lookup error:', error)
            }
        }
    }

    return (
        <div className="mb-4">
            <h5 className="mb-3">{label}</h5>

            {/* Address Input with Autocomplete */}
            <div className="mb-3 position-relative">
                <label className="form-label">Street Address {required && '*'}</label>
                <div className="input-group">
                    <input
                        ref={addressInputRef}
                        type="text"
                        className={`form-control ${errors[`${prefix}.address`] ? 'is-invalid' : ''}`}
                        value={address.address || ''}
                        onChange={handleInputChange}
                        placeholder="Start typing your address..."
                        autoComplete="off"
                    />
                    {isSearching && (
                        <span className="input-group-text">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Searching...</span>
                            </div>
                        </span>
                    )}
                </div>
                {errors[`${prefix}.address`] && (
                    <div className="invalid-feedback">{errors[`${prefix}.address`]}</div>
                )}

                {/* Address Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000 }}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion.id}
                                className="px-3 py-2 cursor-pointer border-bottom suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.classList.add('bg-light')}
                                onMouseLeave={(e) => e.target.classList.remove('bg-light')}
                            >
                                <div className="d-flex align-items-center">
                                    <i className={`bi-${suggestion.type === 'postcode' ? 'geo-alt' : 'building'} me-2 text-muted`}></i>
                                    <div>
                                        <div className="fw-medium">{suggestion.display}</div>
                                        {suggestion.type === 'postcode' && (
                                            <small className="text-muted">Postcode Database</small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Address Fields */}
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Suburb {required && '*'}</label>
                    <input
                        type="text"
                        className={`form-control ${errors[`${prefix}.suburb`] ? 'is-invalid' : ''}`}
                        value={address.suburb || ''}
                        onChange={(e) => onAddressChange({ suburb: e.target.value })}
                        placeholder="Enter suburb"
                    />
                    {errors[`${prefix}.suburb`] && (
                        <div className="invalid-feedback">{errors[`${prefix}.suburb`]}</div>
                    )}
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">State {required && '*'}</label>
                    <select
                        className={`form-select ${errors[`${prefix}.state`] ? 'is-invalid' : ''}`}
                        value={address.state || ''}
                        onChange={(e) => onAddressChange({ state: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option value="NSW">NSW</option>
                        <option value="VIC">VIC</option>
                        <option value="QLD">QLD</option>
                        <option value="WA">WA</option>
                        <option value="SA">SA</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                    </select>
                    {errors[`${prefix}.state`] && (
                        <div className="invalid-feedback">{errors[`${prefix}.state`]}</div>
                    )}
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">Postcode {required && '*'}</label>
                    <input
                        type="text"
                        className={`form-control ${errors[`${prefix}.postcode`] ? 'is-invalid' : ''}`}
                        value={address.postcode || ''}
                        onChange={handlePostcodeChange}
                        placeholder="0000"
                        maxLength="4"
                        pattern="[0-9]{4}"
                    />
                    {errors[`${prefix}.postcode`] && (
                        <div className="invalid-feedback">{errors[`${prefix}.postcode`]}</div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .suggestion-item:hover {
                    background-color: #f8f9fa !important;
                }
                .suggestion-item:last-child {
                    border-bottom: none !important;
                }
            `}</style>
        </div>
    )
}
