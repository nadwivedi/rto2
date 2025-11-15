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

  // Check if vehicle number contains any spaces (should not have spaces)
  if (vehicleNumber.includes(' ')) {
    return {
      isValid: false,
      message: 'Vehicle number should not contain spaces (e.g., CG04AA1234)'
    }
  }

  // Check if vehicle number is exactly 10 characters
  if (cleanVehicleNumber.length !== 10) {
    return {
      isValid: false,
      message: `Vehicle number must be exactly 10 characters (current: ${cleanVehicleNumber.length})`
    }
  }

  // Validate vehicle number pattern
  // Format: 2 letters (state) + 2 digits (district) + 2 letters (series) + 4 digits
  // Example: CG04AA1234
  const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/

  if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
    return {
      isValid: false,
      message: 'Invalid format. Use: 2 letters + 2 digits + 2 letters + 4 digits (e.g., CG04AA1234)'
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
 * @returns {string} - Formatted vehicle number (e.g., CG 04 AA 1234)
 */
export const formatVehicleNumber = (vehicleNumber) => {
  if (!vehicleNumber) return ''

  // Remove all spaces and convert to uppercase
  const clean = vehicleNumber.trim().replace(/\s+/g, '').toUpperCase()

  // If length is not 10, return as is
  if (clean.length !== 10) return clean

  // Format: XX 00 XX 0000 (always 2 letters for series)
  const stateCode = clean.substring(0, 2)
  const districtCode = clean.substring(2, 4)
  const series = clean.substring(4, 6)
  const number = clean.substring(6, 10)

  return `${stateCode} ${districtCode} ${series} ${number}`
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
 * Enforces vehicle number format as user types
 * Format: LL-DD-LL-DDDD (L=Letter, D=Digit)
 * @param {string} currentValue - Current input value
 * @param {string} newValue - New value being typed
 * @returns {string} - Formatted and validated value
 */
export const enforceVehicleNumberFormat = (currentValue, newValue) => {
  if (!newValue) return ''

  // Remove spaces and convert to uppercase
  let cleaned = newValue.replace(/\s+/g, '').toUpperCase()

  // Build the valid string character by character based on position
  let result = ''

  for (let i = 0; i < cleaned.length && i < 10; i++) {
    const char = cleaned[i]

    if (i < 2) {
      // Position 0-1: Only letters (State Code)
      if (/[A-Z]/.test(char)) {
        result += char
      } else {
        // Skip invalid characters at this position
        continue
      }
    } else if (i >= 2 && i < 4) {
      // Position 2-3: Only digits (District Code)
      if (/[0-9]/.test(char)) {
        result += char
      } else {
        // Skip invalid characters at this position
        continue
      }
    } else if (i >= 4 && i < 6) {
      // Position 4-5: Only letters (Series)
      if (/[A-Z]/.test(char)) {
        result += char
      } else {
        // Skip invalid characters at this position
        continue
      }
    } else if (i >= 6 && i < 10) {
      // Position 6-9: Only digits (Vehicle Number)
      if (/[0-9]/.test(char)) {
        result += char
      } else {
        // Skip invalid characters at this position
        continue
      }
    }
  }

  return result
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

  // Check for spaces while typing
  if (vehicleNumber.includes(' ')) {
    return {
      isValid: false,
      message: 'Remove spaces from vehicle number',
      cleaned: cleaned
    }
  }

  // If still typing (less than 10 characters), show progress
  if (cleaned.length < 10) {
    return {
      isValid: false,
      message: `Enter ${10 - cleaned.length} more character${10 - cleaned.length > 1 ? 's' : ''}`,
      cleaned: cleaned
    }
  }

  // If more than 10 characters
  if (cleaned.length > 10) {
    return {
      isValid: false,
      message: 'Vehicle number should be exactly 10 characters',
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

  const stateCode = cleaned.substring(0, 2)
  const districtCode = cleaned.substring(2, 4)
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
