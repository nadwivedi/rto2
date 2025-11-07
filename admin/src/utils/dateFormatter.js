/**
 * Date Formatting Utilities
 *
 * This utility provides automatic date formatting with dash insertion
 * for DD-MM-YYYY format. Use this in all date input fields across the app.
 */

/**
 * Formats a date string with automatic dash insertion
 *
 * @param {string} value - The input value from the date field
 * @returns {string} - Formatted date string in DD-MM-YYYY format
 *
 * @example
 * formatDateInput('07')       // Returns: '07-'
 * formatDateInput('071')      // Returns: '07-1'
 * formatDateInput('0711')     // Returns: '07-11-'
 * formatDateInput('07112')    // Returns: '07-11-2'
 * formatDateInput('071125')   // Returns: '07-11-2025' (auto-expands 2-digit year)
 * formatDateInput('07112025') // Returns: '07-11-2025'
 */
export const formatDateInput = (value) => {
  // Remove all non-digit characters except dashes
  let cleaned = value.replace(/[^\d-]/g, '')

  // Remove existing dashes to reformat
  let digitsOnly = cleaned.replace(/-/g, '')

  // Limit to 8 digits (DDMMYYYY)
  digitsOnly = digitsOnly.slice(0, 8)

  // Auto-insert dashes: DD-MM-YYYY
  let formatted = digitsOnly

  // Format based on length
  if (digitsOnly.length <= 2) {
    // Just digits, or add dash immediately after 2nd digit
    formatted = digitsOnly
    if (digitsOnly.length === 2) {
      formatted = digitsOnly + '-'
    }
  } else if (digitsOnly.length <= 4) {
    // DD-MM format, add dash after 4th digit
    formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2)
    if (digitsOnly.length === 4) {
      formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2) + '-'
    }
  } else {
    // DD-MM-YYYY format (5+ digits)
    formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2, 4) + '-' + digitsOnly.slice(4)
  }

  // Auto-expand 2-digit year to 4-digit when complete (DDMMYY -> DDMMYYYY)
  if (digitsOnly.length === 6) {
    const day = digitsOnly.slice(0, 2)
    const month = digitsOnly.slice(2, 4)
    const year = digitsOnly.slice(4, 6)
    const yearNum = parseInt(year, 10)
    const fullYear = yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
    formatted = `${day}-${month}-${fullYear}`
  }

  return formatted
}

/**
 * Handles date input change with automatic formatting and auto-focus to next field
 *
 * Use this in your handleChange function for date fields
 *
 * @param {Event} e - The input change event
 * @param {Function} setFormData - The state setter function
 * @param {boolean} autoFocusNext - Whether to auto-focus next field when date is complete
 * @returns {boolean} - Returns true if handled, false otherwise
 *
 * @example
 * const handleChange = (e) => {
 *   if (handleDateInputChange(e, setFormData, true)) return
 *   // ... other field handling
 * }
 */
export const handleDateInputChange = (e, setFormData, autoFocusNext = true) => {
  const { name, value } = e.target

  // Only handle date fields
  const dateFields = ['validFrom', 'validTo', 'taxFrom', 'taxTo', 'issueDate', 'expiryDate',
                      'licenseIssueDate', 'licenseExpiryDate', 'learningLicenseIssueDate',
                      'learningLicenseExpiryDate', 'dateOfBirth', 'applicationDate']

  if (dateFields.includes(name)) {
    const formatted = formatDateInput(value)

    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }))

    // Auto-focus to next field when date is complete (10 chars = DD-MM-YYYY)
    if (autoFocusNext && formatted.length === 10) {
      // Use setTimeout to ensure state update completes first
      setTimeout(() => {
        const form = e.target.form
        if (form) {
          const elements = Array.from(form.elements)
          const currentIndex = elements.indexOf(e.target)

          // Find next focusable input
          for (let i = currentIndex + 1; i < elements.length; i++) {
            const nextElement = elements[i]
            if (
              (nextElement.tagName === 'INPUT' || nextElement.tagName === 'SELECT' || nextElement.tagName === 'TEXTAREA') &&
              !nextElement.disabled &&
              !nextElement.readOnly &&
              nextElement.type !== 'hidden'
            ) {
              nextElement.focus()
              break
            }
          }
        }
      }, 0)
    }

    return true // Handled
  }

  return false // Not handled
}

/**
 * Validates if a date string is complete and valid
 *
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @returns {boolean} - True if date is valid
 *
 * @example
 * isValidDate('07-11-2025') // Returns: true
 * isValidDate('07-11')      // Returns: false
 * isValidDate('32-13-2025') // Returns: false
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false

  const parts = dateString.split('-')
  if (parts.length !== 3) return false

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)

  // Basic validation
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > 2100) return false

  // Check days in month
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day
}

/**
 * Converts 2-digit year to 4-digit year
 *
 * @param {string} yearStr - 2-digit year string
 * @returns {number} - 4-digit year
 *
 * @example
 * expandYear('25') // Returns: 2025
 * @example
 * expandYear('99') // Returns: 1999
 */
export const expandYear = (yearStr) => {
  const yearNum = parseInt(yearStr, 10)
  // 00-50 → 2000-2050, 51-99 → 1951-1999
  return yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
}

/**
 * Formats date on blur - handles 2-digit year expansion
 *
 * @param {Event} e - The blur event
 * @param {Function} setFormData - The state setter function
 *
 * @example
 * <input onBlur={(e) => handleDateBlur(e, setFormData)} />
 */
export const handleDateBlur = (e, setFormData) => {
  const { name, value } = e.target

  const parts = value.split('-')

  // Only format if we have a complete date with 3 parts
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    let year = parts[2]

    // Auto-expand 2-digit year to 4-digit (only when exactly 2 digits)
    if (year.length === 2 && /^\d{2}$/.test(year)) {
      year = expandYear(year)
    }

    // Normalize to DD-MM-YYYY format (if year is 4 digits or was expanded)
    if (year.toString().length === 4) {
      const formattedValue = `${day}-${month}-${year}`
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    }
  }
}

/**
 * Gets today's date in DD-MM-YYYY format
 *
 * @returns {string} - Today's date formatted as DD-MM-YYYY
 *
 * @example
 * getTodayDate() // Returns: '07-11-2025'
 */
export const getTodayDate = () => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Parses DD-MM-YYYY date string to Date object
 *
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @returns {Date|null} - Date object or null if invalid
 *
 * @example
 * parseDate('07-11-2025') // Returns: Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null

  const parts = dateString.split(/[/-]/)
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}

/**
 * Formats Date object to DD-MM-YYYY string
 *
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 *
 * @example
 * formatDateToString(new Date()) // Returns: '07-11-2025'
 */
export const formatDateToString = (date) => {
  if (!date || !(date instanceof Date)) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
