'use client'

import { useState, useEffect } from 'react'

export default function PalletCalculator({
    palletDetails,
    onPalletChange,
    errors
}) {
    const [standardPallets, setStandardPallets] = useState(palletDetails.standardPallets || 0)
    const [nonStandardPallets, setNonStandardPallets] = useState(palletDetails.nonStandardPallets || [])
    const [showAddNonStandard, setShowAddNonStandard] = useState(false)

    // Standard pallet dimensions (as per Update_1.02.md)
    const STANDARD_PALLET = {
        length: 1200, // mm
        width: 1200,  // mm
        height: 1200, // mm
        maxWeight: 500 // kg
    }

    useEffect(() => {
        calculateTotals()
    }, [standardPallets, nonStandardPallets])

    const calculateTotals = () => {
        let totalWeight = 0
        let totalVolume = 0

        // Calculate standard pallets
        totalWeight += standardPallets * STANDARD_PALLET.maxWeight
        totalVolume += standardPallets * calculateVolume(
            STANDARD_PALLET.length,
            STANDARD_PALLET.width,
            STANDARD_PALLET.height
        )

        // Calculate non-standard pallets
        nonStandardPallets.forEach(pallet => {
            totalWeight += parseFloat(pallet.weight || 0)
            totalVolume += calculateVolume(
                parseFloat(pallet.length || 0),
                parseFloat(pallet.width || 0),
                parseFloat(pallet.height || 0)
            )
        })

        onPalletChange({
            standardPallets,
            nonStandardPallets,
            totalWeight: totalWeight,
            totalVolume: totalVolume
        })
    }

    const calculateVolume = (length, width, height) => {
        // Convert mm to m³
        return (length * width * height) / 1000000000
    }

    const handleStandardPalletChange = (value) => {
        const count = Math.max(0, parseInt(value) || 0)
        setStandardPallets(count)
    }

    const addNonStandardPallet = () => {
        const newPallet = {
            id: Date.now(),
            length: '',
            width: '',
            height: '',
            weight: '',
            description: ''
        }
        setNonStandardPallets([...nonStandardPallets, newPallet])
        setShowAddNonStandard(false)
    }

    const updateNonStandardPallet = (id, field, value) => {
        setNonStandardPallets(pallets =>
            pallets.map(pallet =>
                pallet.id === id
                    ? { ...pallet, [field]: value }
                    : pallet
            )
        )
    }

    const removeNonStandardPallet = (id) => {
        setNonStandardPallets(pallets =>
            pallets.filter(pallet => pallet.id !== id)
        )
    }

    const isNonStandardSize = (length, width, height) => {
        return length > STANDARD_PALLET.length ||
            width > STANDARD_PALLET.width ||
            height > STANDARD_PALLET.height
    }

    const formatVolume = (volume) => {
        return volume.toFixed(3)
    }

    const formatWeight = (weight) => {
        return weight.toFixed(1)
    }

    return (
        <div className="mb-4">
            <h5 className="mb-3">
                <i className="bi-boxes me-2"></i>
                Pallet Details
            </h5>

            {/* Standard Pallets */}
            <div className="card mb-3">
                <div className="card-header">
                    <h6 className="mb-0">
                        <i className="bi-box me-2"></i>
                        Standard Pallets
                    </h6>
                    <small className="text-muted">
                        Size: {STANDARD_PALLET.length}mm × {STANDARD_PALLET.width}mm × {STANDARD_PALLET.height}mm,
                        Max weight: {STANDARD_PALLET.maxWeight}kg each
                    </small>
                </div>
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-4">
                            <label className="form-label">Number of Standard Pallets</label>
                            <div className="input-group">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => handleStandardPalletChange(standardPallets - 1)}
                                    disabled={standardPallets <= 0}
                                >
                                    <i className="bi-dash"></i>
                                </button>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    value={standardPallets}
                                    onChange={(e) => handleStandardPalletChange(e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => handleStandardPalletChange(standardPallets + 1)}
                                >
                                    <i className="bi-plus"></i>
                                </button>
                            </div>
                        </div>

                        {standardPallets > 0 && (
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Total Weight</small>
                                        <strong>{formatWeight(standardPallets * STANDARD_PALLET.maxWeight)} kg</strong>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Total Volume</small>
                                        <strong>{formatVolume(standardPallets * calculateVolume(
                                            STANDARD_PALLET.length,
                                            STANDARD_PALLET.width,
                                            STANDARD_PALLET.height
                                        ))} m³</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Non-Standard Pallets */}
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0">
                            <i className="bi-box-seam me-2"></i>
                            Non-Standard Pallets
                        </h6>
                        <small className="text-muted">
                            Items larger than {STANDARD_PALLET.length}mm × {STANDARD_PALLET.width}mm × {STANDARD_PALLET.height}mm
                        </small>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowAddNonStandard(true)}
                    >
                        <i className="bi-plus me-1"></i>
                        Add Non-Standard
                    </button>
                </div>

                <div className="card-body">
                    {nonStandardPallets.length === 0 ? (
                        <p className="text-muted mb-0">No non-standard pallets added</p>
                    ) : (
                        <div className="space-y-3">
                            {nonStandardPallets.map((pallet, index) => (
                                <div key={pallet.id} className="border rounded p-3 mb-3">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h6 className="mb-0">Non-Standard Pallet #{index + 1}</h6>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeNonStandardPallet(pallet.id)}
                                        >
                                            <i className="bi-trash"></i>
                                        </button>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Length (mm)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pallet.length}
                                                onChange={(e) => updateNonStandardPallet(pallet.id, 'length', e.target.value)}
                                                min="1"
                                                placeholder="1200"
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Width (mm)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pallet.width}
                                                onChange={(e) => updateNonStandardPallet(pallet.id, 'width', e.target.value)}
                                                min="1"
                                                placeholder="1200"
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Height (mm)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pallet.height}
                                                onChange={(e) => updateNonStandardPallet(pallet.id, 'height', e.target.value)}
                                                min="1"
                                                placeholder="1200"
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Weight (kg)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pallet.weight}
                                                onChange={(e) => updateNonStandardPallet(pallet.id, 'weight', e.target.value)}
                                                min="0"
                                                max="1000"
                                                step="0.1"
                                                placeholder="500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={pallet.description}
                                            onChange={(e) => updateNonStandardPallet(pallet.id, 'description', e.target.value)}
                                            placeholder="Describe the contents or special requirements"
                                        />
                                    </div>

                                    {/* Validation Warning */}
                                    {pallet.length && pallet.width && pallet.height && !isNonStandardSize(
                                        parseFloat(pallet.length),
                                        parseFloat(pallet.width),
                                        parseFloat(pallet.height)
                                    ) && (
                                            <div className="alert alert-warning">
                                                <i className="bi-exclamation-triangle me-2"></i>
                                                This pallet fits standard dimensions. Consider using standard pallets instead.
                                            </div>
                                        )}

                                    {/* Individual Pallet Calculations */}
                                    {pallet.length && pallet.width && pallet.height && pallet.weight && (
                                        <div className="bg-light p-2 rounded">
                                            <div className="row">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Volume</small>
                                                    <strong>{formatVolume(calculateVolume(
                                                        parseFloat(pallet.length),
                                                        parseFloat(pallet.width),
                                                        parseFloat(pallet.height)
                                                    ))} m³</strong>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Weight</small>
                                                    <strong>{formatWeight(parseFloat(pallet.weight))} kg</strong>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Non-Standard Pallet Modal/Form */}
                    {showAddNonStandard && (
                        <div className="bg-light p-3 rounded mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Add Non-Standard Pallet</h6>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowAddNonStandard(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                            <p className="text-muted mb-3">
                                Non-standard pallets are items that exceed the standard pallet dimensions
                                ({STANDARD_PALLET.length}mm × {STANDARD_PALLET.width}mm × {STANDARD_PALLET.height}mm).
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={addNonStandardPallet}
                            >
                                <i className="bi-plus me-2"></i>
                                Add Pallet
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Total Summary */}
            <div className="card bg-primary text-white">
                <div className="card-body">
                    <h6 className="card-title mb-3">
                        <i className="bi-calculator me-2"></i>
                        Total Shipment Summary
                    </h6>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="text-center">
                                <div className="h4 mb-1">{standardPallets + nonStandardPallets.length}</div>
                                <small>Total Pallets</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="text-center">
                                <div className="h4 mb-1">{standardPallets}</div>
                                <small>Standard</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="text-center">
                                <div className="h4 mb-1">{formatWeight(palletDetails.totalWeight || 0)}</div>
                                <small>Total Weight (kg)</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="text-center">
                                <div className="h4 mb-1">{formatVolume(palletDetails.totalVolume || 0)}</div>
                                <small>Total Volume (m³)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation Errors */}
            {errors['shipment.pallets'] && (
                <div className="alert alert-danger mt-3">
                    <i className="bi-exclamation-triangle me-2"></i>
                    {errors['shipment.pallets']}
                </div>
            )}

            {/* Helpful Tips */}
            <div className="mt-3">
                <div className="accordion" id="palletTips">
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#palletTipsContent"
                            >
                                <i className="bi-lightbulb me-2"></i>
                                Pallet Calculation Tips
                            </button>
                        </h2>
                        <div id="palletTipsContent" className="accordion-collapse collapse">
                            <div className="accordion-body">
                                <ul className="mb-0">
                                    <li><strong>Standard Pallets:</strong> Use for items that fit within {STANDARD_PALLET.length}mm × {STANDARD_PALLET.width}mm × {STANDARD_PALLET.height}mm and weigh up to {STANDARD_PALLET.maxWeight}kg</li>
                                    <li><strong>Non-Standard Pallets:</strong> Use for oversized items that exceed standard dimensions</li>
                                    <li><strong>Weight Limits:</strong> Maximum {STANDARD_PALLET.maxWeight}kg per standard pallet, up to 1000kg for non-standard items</li>
                                    <li><strong>Accurate Measurements:</strong> Precise dimensions help carriers provide better quotes</li>
                                    <li><strong>Volume Pricing:</strong> Some carriers charge by volume, others by weight - provide both for accurate pricing</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
