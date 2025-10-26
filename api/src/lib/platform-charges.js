// @ts-nocheck
/**
 * Platform charge calculation utilities for API
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