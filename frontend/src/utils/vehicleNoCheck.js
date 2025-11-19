/**
 * Vehicle Number Validation Utility
 * Validates Indian vehicle registration numbers
 * Supports both formats:
 * - 10 characters: CG01AB1234 (State + District + 2-letter Series + Number)
 * - 9 characters: CG04G1234 (State + District + 1-letter Series + Number)
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
      message: 'Vehicle number should not contain spaces (e.g., CG04AA1234 or CG04G1234)'
    }
  }

  // Check if vehicle number is 9 or 10 characters
  if (cleanVehicleNumber.length !== 9 && cleanVehicleNumber.length !== 10) {
    return {
      isValid: false,
      message: `Vehicle number must be 9 or 10 characters (current: ${cleanVehicleNumber.length})`
    }
  }

  // Validate vehicle number patterns
  // Format 1 (10 chars): 2 letters (state) + 2 digits (district) + 2 letters (series) + 4 digits
  // Example: CG04AA1234
  const vehicleNumberPattern10 = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/

  // Format 2 (9 chars): 2 letters (state) + 2 digits (district) + 1 letter (series) + 4 digits
  // Example: CG04G1234
  const vehicleNumberPattern9 = /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/

  const isValid10 = vehicleNumberPattern10.test(cleanVehicleNumber)
  const isValid9 = vehicleNumberPattern9.test(cleanVehicleNumber)

  if (!isValid10 && !isValid9) {
    return {
      isValid: false,
      message: 'Invalid format. Use: CG04AA1234 (10 chars) or CG04G1234 (9 chars)'
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
 * @returns {string} - Formatted vehicle number (e.g., CG 04 AA 1234 or CG 04 G 1234)
 */
export const formatVehicleNumber = (vehicleNumber) => {
  if (!vehicleNumber) return ''

  // Remove all spaces and convert to uppercase
  const clean = vehicleNumber.trim().replace(/\s+/g, '').toUpperCase()

  // Handle 10-character format: XX 00 XX 0000
  if (clean.length === 10) {
    const stateCode = clean.substring(0, 2)
    const districtCode = clean.substring(2, 4)
    const series = clean.substring(4, 6)
    const number = clean.substring(6, 10)
    return `${stateCode} ${districtCode} ${series} ${number}`
  }

  // Handle 9-character format: XX 00 X 0000
  if (clean.length === 9) {
    const stateCode = clean.substring(0, 2)
    const districtCode = clean.substring(2, 4)
    const series = clean.substring(4, 5)
    const number = clean.substring(5, 9)
    return `${stateCode} ${districtCode} ${series} ${number}`
  }

  // If length is neither 9 nor 10, return as is
  return clean
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
 * Supports both formats:
 * - 10 chars: LL-DD-LL-DDDD (L=Letter, D=Digit)
 * - 9 chars: LL-DD-L-DDDD
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
  let is9CharFormat = false
  let is10CharFormat = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (i < 2) {
      // Position 0-1: Only letters (State Code)
      if (/[A-Z]/.test(char)) {
        result += char
      } else {
        continue
      }
    } else if (i >= 2 && i < 4) {
      // Position 2-3: Only digits (District Code)
      if (/[0-9]/.test(char)) {
        result += char
      } else {
        continue
      }
    } else if (i === 4) {
      // Position 4: Always letter (first letter of series)
      if (/[A-Z]/.test(char)) {
        result += char
      } else {
        continue
      }
    } else if (i === 5) {
      // Position 5: Can be letter (2nd series letter) or digit (start of number for 9-char format)
      if (/[A-Z]/.test(char)) {
        // If it's a letter, this is 10-character format
        is10CharFormat = true
        result += char
      } else if (/[0-9]/.test(char)) {
        // If it's a digit, this is 9-character format, add the digit
        is9CharFormat = true
        result += char
      } else {
        continue
      }
    } else if (i >= 6) {
      // Check if we should stop based on format
      if (is9CharFormat && i >= 9) {
        // 9-char format: stop at position 8 (9 total chars)
        break
      }
      if (is10CharFormat && i >= 10) {
        // 10-char format: stop at position 9 (10 total chars)
        break
      }

      // Position 6+: Only digits (Vehicle Number)
      if (/[0-9]/.test(char)) {
        result += char
      } else {
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

  // If still typing (less than 9 characters), show progress
  if (cleaned.length < 9) {
    return {
      isValid: false,
      message: `Enter ${9 - cleaned.length} more character${9 - cleaned.length > 1 ? 's' : ''}`,
      cleaned: cleaned
    }
  }

  // If more than 10 characters
  if (cleaned.length > 10) {
    return {
      isValid: false,
      message: 'Vehicle number should be 9 or 10 characters',
      cleaned: cleaned
    }
  }

  // If 9 or 10 characters, validate fully
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

  // Must be 9 or 10 characters
  if (cleaned.length !== 9 && cleaned.length !== 10) {
    return null
  }

  const validation = validateVehicleNumber(cleaned)
  if (!validation.isValid) {
    return null
  }

  const stateCode = cleaned.substring(0, 2)
  const districtCode = cleaned.substring(2, 4)

  let series, number

  // Parse based on length
  if (cleaned.length === 10) {
    // 10-char format: CG04AA1234
    series = cleaned.substring(4, 6)
    number = cleaned.substring(6, 10)
  } else {
    // 9-char format: CG04G1234
    series = cleaned.substring(4, 5)
    number = cleaned.substring(5, 9)
  }

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
