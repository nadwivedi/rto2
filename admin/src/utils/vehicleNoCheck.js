/**
 * Vehicle Number Validation Utility
 * Validates Indian vehicle registration numbers
 * Format: CG01AB1234 (State Code + District Code + Series + Number)
 */

/**
 * Validates if the vehicle number follows the correct format
 * @param {string} vehicleNumber - Vehicle number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateVehicleNumber = (vehicleNumber) => {
  // Check if vehicle number is provided
  if (!vehicleNumber) {
    return {
      isValid: false,
      message: 'Vehicle number is required'
    }
  }

  // Remove whitespace and convert to uppercase
  const cleanVehicleNumber = vehicleNumber.trim().replace(/\s+/g, '').toUpperCase()

  // Check if vehicle number is exactly 10 characters
  if (cleanVehicleNumber.length !== 10) {
    return {
      isValid: false,
      message: 'Vehicle number must be exactly 10 characters'
    }
  }

  // Validate vehicle number pattern
  // Format: 2 letters (state) + 2 digits (district) + 1-2 letters (series) + 4 digits
  // Example: CG01AB1234 or CG01A1234
  const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/

  if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
    return {
      isValid: false,
      message: 'Invalid vehicle number format (e.g., CG01AB1234)'
    }
  }

  return {
    isValid: true,
    message: 'Valid vehicle number'
  }
}

/**
 * Formats vehicle number with proper spacing
 * @param {string} vehicleNumber - Vehicle number to format
 * @returns {string} - Formatted vehicle number (e.g., CG 01 AB 1234)
 */
export const formatVehicleNumber = (vehicleNumber) => {
  if (!vehicleNumber) return ''

  // Remove all spaces and convert to uppercase
  const clean = vehicleNumber.trim().replace(/\s+/g, '').toUpperCase()

  // If length is not 10, return as is
  if (clean.length !== 10) return clean

  // Format: XX 00 XX 0000 or XX 00 X 0000
  const stateCode = clean.substring(0, 2)
  const districtCode = clean.substring(2, 4)

  // Check if it has 1 or 2 letter series
  const hasDoubleLetterSeries = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(clean)

  if (hasDoubleLetterSeries) {
    const series = clean.substring(4, 6)
    const number = clean.substring(6, 10)
    return `${stateCode} ${districtCode} ${series} ${number}`
  } else {
    const series = clean.substring(4, 5)
    const number = clean.substring(5, 10)
    return `${stateCode} ${districtCode} ${series} ${number}`
  }
}

/**
 * Cleans and returns vehicle number without spaces in uppercase
 * @param {string} vehicleNumber - Vehicle number to clean
 * @returns {string} - Cleaned vehicle number
 */
export const cleanVehicleNumber = (vehicleNumber) => {
  if (!vehicleNumber) return ''
  return vehicleNumber.trim().replace(/\s+/g, '').toUpperCase()
}

/**
 * Real-time validation for input fields
 * @param {string} vehicleNumber - Vehicle number being typed
 * @returns {object} - { isValid: boolean, message: string, cleaned: string }
 */
export const validateVehicleNumberRealtime = (vehicleNumber) => {
  if (!vehicleNumber || vehicleNumber.trim() === '') {
    return {
      isValid: false,
      message: '',
      cleaned: ''
    }
  }

  const cleaned = cleanVehicleNumber(vehicleNumber)

  // If still typing (less than 10 characters), don't show error yet
  if (cleaned.length < 10) {
    return {
      isValid: false,
      message: '',
      cleaned: cleaned
    }
  }

  // If 10 characters, validate fully
  const validation = validateVehicleNumber(cleaned)

  return {
    isValid: validation.isValid,
    message: validation.isValid ? '' : validation.message,
    cleaned: cleaned
  }
}

/**
 * Get vehicle number parts
 * @param {string} vehicleNumber - Vehicle number
 * @returns {object} - { stateCode, districtCode, series, number }
 */
export const parseVehicleNumber = (vehicleNumber) => {
  const cleaned = cleanVehicleNumber(vehicleNumber)

  if (cleaned.length !== 10) {
    return null
  }

  const validation = validateVehicleNumber(cleaned)
  if (!validation.isValid) {
    return null
  }

  const hasDoubleLetterSeries = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(cleaned)

  if (hasDoubleLetterSeries) {
    return {
      stateCode: cleaned.substring(0, 2),
      districtCode: cleaned.substring(2, 4),
      series: cleaned.substring(4, 6),
      number: cleaned.substring(6, 10)
    }
  } else {
    return {
      stateCode: cleaned.substring(0, 2),
      districtCode: cleaned.substring(2, 4),
      series: cleaned.substring(4, 5),
      number: cleaned.substring(5, 10)
    }
  }
}
