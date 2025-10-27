// Date helper functions for the RTO Admin application

/**
 * Format a date to DD-MM-YYYY format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Get a date 5 years from now
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} Date 5 years in the future
 */
export const getFiveYearsFromNow = (fromDate = new Date()) => {
  const date = new Date(fromDate)
  date.setFullYear(date.getFullYear() + 5)
  return date
}

/**
 * Get a date 1 year from now
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {Date} Date 1 year in the future
 */
export const getOneYearFromNow = (fromDate = new Date()) => {
  const date = new Date(fromDate)
  date.setFullYear(date.getFullYear() + 1)
  return date
}

/**
 * Check if Part B permit is expiring soon (within 30 days)
 * @param {Date|string} expiryDate - Expiry date to check
 * @returns {boolean} True if expiring within 30 days
 */
export const isPartBExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false

  const expiry = new Date(expiryDate)
  if (isNaN(expiry.getTime())) return false

  const today = new Date()
  const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

  return daysRemaining >= 0 && daysRemaining <= 30
}

/**
 * Check if Part A permit is expiring soon (within 60 days)
 * @param {Date|string} expiryDate - Expiry date to check
 * @returns {boolean} True if expiring within 60 days
 */
export const isPartAExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false

  const expiry = new Date(expiryDate)
  if (isNaN(expiry.getTime())) return false

  const today = new Date()
  const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

  return daysRemaining >= 0 && daysRemaining <= 60
}

/**
 * Get the number of days remaining until a date
 * @param {Date|string} targetDate - Target date
 * @returns {number} Days remaining (negative if past)
 */
export const getDaysRemaining = (targetDate) => {
  if (!targetDate) return 0

  const target = new Date(targetDate)
  if (isNaN(target.getTime())) return 0

  const today = new Date()
  const daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  return daysRemaining
}

/**
 * Convert DD-MM-YYYY format to Date object
 * @param {string} dateString - Date string in DD-MM-YYYY format
 * @returns {Date} Date object
 */
export const parseFormattedDate = (dateString) => {
  if (!dateString) return null

  const parts = dateString.split('-')
  if (parts.length !== 3) return null

  const [day, month, year] = parts
  return new Date(year, month - 1, day)
}

/**
 * Get date in YYYY-MM-DD format (for input fields)
 * @param {Date|string} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const toInputDate = (date) => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default {
  formatDate,
  getFiveYearsFromNow,
  getOneYearFromNow,
  isPartBExpiringSoon,
  isPartAExpiringSoon,
  getDaysRemaining,
  parseFormattedDate,
  toInputDate
}
