/**
 * Payment validation utility functions
 * Provides reusable logic for handling payment calculations and validations
 */

/**
 * Calculates balance and caps paid amount at total fee if it exceeds
 * @param {string} fieldName - The field being changed ('totalFee' or 'paid')
 * @param {string} value - The new value entered by user
 * @param {object} currentFormData - Current form data object containing totalFee and paid
 * @returns {object} Object containing capped paid amount, calculated balance, and validation flag
 */
export const handlePaymentCalculation = (fieldName, value, currentFormData) => {
  const totalFee = fieldName === 'totalFee' ? parseFloat(value) || 0 : parseFloat(currentFormData.totalFee) || 0
  let paid = fieldName === 'paid' ? parseFloat(value) || 0 : parseFloat(currentFormData.paid) || 0

  // Cap paid amount at total fee if it exceeds
  if (fieldName === 'paid' && paid > totalFee && totalFee > 0) {
    paid = totalFee
  }

  const balance = totalFee - paid

  return {
    paid: paid.toString(),
    balance: balance.toString(),
    paidExceedsTotal: false // Always false since we cap the value
  }
}

/**
 * Validates if paid amount exceeds total fee
 * @param {number|string} paid - Paid amount
 * @param {number|string} totalFee - Total fee amount
 * @returns {boolean} True if paid exceeds total fee
 */
export const validatePaidAmount = (paid, totalFee) => {
  const paidAmount = parseFloat(paid) || 0
  const totalAmount = parseFloat(totalFee) || 0
  return paidAmount > totalAmount && totalAmount > 0
}

/**
 * Formats payment amount to 2 decimal places
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toFixed(2)
}
