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
 * State code to State name mapping for Indian states and UTs
 */
const STATE_CODE_MAP = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CG': 'Chhattisgarh',
  'DD': 'Daman and Diu',
  'DL': 'Delhi',
  'DN': 'Dadra and Nagar Haveli',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HP': 'Himachal Pradesh',
  'HR': 'Haryana',
  'JH': 'Jharkhand',
  'JK': 'Jammu and Kashmir',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'MH': 'Maharashtra',
  'ML': 'Meghalaya',
  'MN': 'Manipur',
  'MP': 'Madhya Pradesh',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'OR': 'Odisha',
  'PB': 'Punjab',
  'PY': 'Puducherry',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TR': 'Tripura',
  'TS': 'Telangana',
  'UK': 'Uttarakhand',
  'UP': 'Uttar Pradesh',
  'WB': 'West Bengal'
}

/**
 * Get state name from state code
 * @param {string} stateCode - Two letter state code
 * @returns {string} - Full state name or state code if not found
 */
export const getStateName = (stateCode) => {
  if (!stateCode) return ''
  const code = stateCode.toUpperCase()
  return STATE_CODE_MAP[code] || code
}

/**
 * Get vehicle number parts
 * @param {string} vehicleNumber - Vehicle number
 * @returns {object} - { stateCode, stateName, districtCode, series, number, last4Digits, rtoCode }
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

  const stateCode = cleaned.substring(0, 2)
  const districtCode = cleaned.substring(2, 4)

  if (hasDoubleLetterSeries) {
    const series = cleaned.substring(4, 6)
    const number = cleaned.substring(6, 10)

    return {
      stateCode,
      stateName: getStateName(stateCode),
      districtCode,
      rtoCode: `${stateCode}${districtCode}`,
      series,
      number,
      last4Digits: number,
      fullNumber: cleaned
    }
  } else {
    const series = cleaned.substring(4, 5)
    const number = cleaned.substring(5, 10)

    return {
      stateCode,
      stateName: getStateName(stateCode),
      districtCode,
      rtoCode: `${stateCode}${districtCode}`,
      series,
      number,
      last4Digits: number.substring(number.length - 4),
      fullNumber: cleaned
    }
  }
}

/**
 * Get formatted parts for display with custom styling
 * @param {string} vehicleNumber - Vehicle number
 * @returns {object} - Parsed parts ready for custom display
 * @example
 * const parts = getVehicleNumberParts('CG04AA4793')
 * // Returns: {
 * //   stateCode: 'CG',
 * //   stateName: 'Chhattisgarh',
 * //   rtoCode: 'CG04',
 * //   series: 'AA',
 * //   last4Digits: '4793',
 * //   fullNumber: 'CG04AA4793'
 * // }
 */
export const getVehicleNumberParts = (vehicleNumber) => {
  return parseVehicleNumber(vehicleNumber)
}
