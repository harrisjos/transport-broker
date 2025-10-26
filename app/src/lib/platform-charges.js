// @ts-nocheck
/**
 * Platform charge calculation utilities
 * Platform retains 5% with minimum $25 and maximum $100
 */

/**
 * Calculate platform charge based on bid amount
 * @param {number} bidAmount - The bid amount in AUD
 * @returns {Object} Platform charge details
 */
export function calculatePlatformCharge(bidAmount) {
    const bidAmountNum = parseFloat(bidAmount) || 0

    // Calculate 5% of bid amount
    const percentageCharge = bidAmountNum * 0.05

    // Apply minimum $25 and maximum $100 constraints
    const platformCharge = Math.min(Math.max(percentageCharge, 25), 100)

    // Calculate carrier net amount (what they receive)
    const carrierNetAmount = bidAmountNum - platformCharge

    return {
        bidAmount: bidAmountNum,
        platformCharge: platformCharge,
        carrierNetAmount: carrierNetAmount,
        platformChargePercentage: (platformCharge / bidAmountNum) * 100
    }
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: AUD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'AUD') {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Validate bid amount for platform charge calculation
 * @param {number} bidAmount - The bid amount to validate
 * @returns {Object} Validation result
 */
export function validateBidAmount(bidAmount) {
    const amount = parseFloat(bidAmount)

    if (isNaN(amount) || amount <= 0) {
        return {
            isValid: false,
            error: 'Bid amount must be a positive number'
        }
    }

    if (amount < 25) {
        return {
            isValid: false,
            error: 'Bid amount must be at least $25 (minimum platform charge)'
        }
    }

    return {
        isValid: true,
        error: null
    }
}

/**
 * Get platform charge breakdown for display
 * @param {number} bidAmount - The bid amount
 * @returns {Object} Detailed breakdown for UI display
 */
export function getPlatformChargeBreakdown(bidAmount) {
    const validation = validateBidAmount(bidAmount)

    if (!validation.isValid) {
        return {
            isValid: false,
            error: validation.error,
            breakdown: null
        }
    }

    const charge = calculatePlatformCharge(bidAmount)

    return {
        isValid: true,
        error: null,
        breakdown: {
            bidAmount: charge.bidAmount,
            platformCharge: charge.platformCharge,
            carrierNetAmount: charge.carrierNetAmount,
            formattedBidAmount: formatCurrency(charge.bidAmount),
            formattedPlatformCharge: formatCurrency(charge.platformCharge),
            formattedCarrierNetAmount: formatCurrency(charge.carrierNetAmount),
            platformChargePercentage: charge.platformChargePercentage.toFixed(2)
        }
    }
}