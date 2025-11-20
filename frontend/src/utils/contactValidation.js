/**
 * Contact validation utility functions
 * Provides reusable logic for validating mobile numbers and email addresses
 */

/**
 * Validates if a mobile number is valid (Indian format - 10 digits)
 * @param {string} mobileNumber - The mobile number to validate
 * @returns {object} Object with isValid boolean and message string
 */
export const validateMobileNumber = (mobileNumber) => {
  // Check if mobile number is provided
  if (!mobileNumber || mobileNumber.trim() === '') {
    return {
      isValid: false,
      message: 'Mobile number is required'
    }
  }

  // Remove any whitespace
  const cleanNumber = mobileNumber.trim()

  // Check if it contains only digits
  if (!/^\d+$/.test(cleanNumber)) {
    return {
      isValid: false,
      message: 'Mobile number must contain only digits (0-9)'
    }
  }

  // Check if it's exactly 10 digits
  if (cleanNumber.length !== 10) {
    return {
      isValid: false,
      message: `Mobile number must be exactly 10 digits (current: ${cleanNumber.length})`
    }
  }

  // Check if it starts with valid digits (6-9 for Indian mobile numbers)
  if (!/^[6-9]/.test(cleanNumber)) {
    return {
      isValid: false,
      message: 'Mobile number must start with 6, 7, 8, or 9'
    }
  }

  return {
    isValid: true,
    message: 'Valid mobile number'
  }
}

/**
 * Enforces mobile number format by allowing only digits
 * @param {string} value - The input value
 * @returns {string} Cleaned value with only digits
 */
export const enforceMobileNumberFormat = (value) => {
  if (!value) return ''
  // Remove all non-digit characters
  return value.replace(/\D/g, '')
}

/**
 * Real-time validation for mobile number input fields
 * @param {string} mobileNumber - Mobile number being typed
 * @returns {object} Object with isValid boolean, message string, and cleaned value
 */
export const validateMobileNumberRealtime = (mobileNumber) => {
  if (!mobileNumber || mobileNumber.trim() === '') {
    return {
      isValid: false,
      message: '',
      cleaned: ''
    }
  }

  const cleaned = enforceMobileNumberFormat(mobileNumber)

  // Check if it contains non-digit characters
  if (mobileNumber !== cleaned) {
    return {
      isValid: false,
      message: 'Only digits allowed (0-9)',
      cleaned: cleaned
    }
  }

  // If still typing (less than 10 digits)
  if (cleaned.length < 10) {
    return {
      isValid: false,
      message: `Enter ${10 - cleaned.length} more digit${10 - cleaned.length > 1 ? 's' : ''}`,
      cleaned: cleaned
    }
  }

  // If more than 10 digits
  if (cleaned.length > 10) {
    return {
      isValid: false,
      message: 'Mobile number should be exactly 10 digits',
      cleaned: cleaned
    }
  }

  // Check if starts with valid digit
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Must start with 6, 7, 8, or 9',
      cleaned: cleaned
    }
  }

  // If exactly 10 digits and starts with valid digit
  return {
    isValid: true,
    message: '',
    cleaned: cleaned
  }
}

/**
 * Validates if an email address is valid
 * @param {string} email - The email address to validate
 * @returns {object} Object with isValid boolean and message string
 */
export const validateEmail = (email) => {
  // Email is optional, so empty is valid
  if (!email || email.trim() === '') {
    return {
      isValid: true,
      message: ''
    }
  }

  const cleanEmail = email.trim()

  // Basic email regex pattern
  // Matches: username@domain.extension
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      message: 'Invalid email format (e.g., user@example.com)'
    }
  }

  // Check for common mistakes
  if (cleanEmail.includes('..')) {
    return {
      isValid: false,
      message: 'Email cannot contain consecutive dots'
    }
  }

  if (cleanEmail.startsWith('.') || cleanEmail.startsWith('@')) {
    return {
      isValid: false,
      message: 'Email cannot start with . or @'
    }
  }

  if (cleanEmail.endsWith('.') || cleanEmail.endsWith('@')) {
    return {
      isValid: false,
      message: 'Email cannot end with . or @'
    }
  }

  return {
    isValid: true,
    message: 'Valid email address'
  }
}

/**
 * Real-time validation for email input fields
 * @param {string} email - Email being typed
 * @returns {object} Object with isValid boolean and message string
 */
export const validateEmailRealtime = (email) => {
  // Empty is valid (optional field)
  if (!email || email.trim() === '') {
    return {
      isValid: true,
      message: ''
    }
  }

  const cleanEmail = email.trim()

  // If user is still typing (doesn't contain @)
  if (!cleanEmail.includes('@')) {
    return {
      isValid: false,
      message: 'Email must contain @',
      cleaned: cleanEmail
    }
  }

  // If contains @ but incomplete
  const parts = cleanEmail.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      message: 'Invalid email format',
      cleaned: cleanEmail
    }
  }

  // If domain doesn't have a dot
  if (!parts[1].includes('.')) {
    return {
      isValid: false,
      message: 'Email domain must contain a dot (e.g., gmail.com)',
      cleaned: cleanEmail
    }
  }

  // Full validation
  return validateEmail(cleanEmail)
}

/**
 * Formats mobile number with spacing for display (e.g., 98765 43210)
 * @param {string} mobileNumber - Mobile number to format
 * @returns {string} Formatted mobile number
 */
export const formatMobileNumber = (mobileNumber) => {
  if (!mobileNumber) return ''
  const cleaned = enforceMobileNumberFormat(mobileNumber)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return cleaned
}
