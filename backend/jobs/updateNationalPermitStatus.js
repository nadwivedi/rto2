const cron = require('node-cron')
const NationalPermit = require('../models/NationalPermit')

// Helper function to calculate Part A status (30-day threshold)
const getPartAStatus = (validTo) => {
  if (!validTo) return 'expired'

  const parts = validTo.split('-')
  if (parts.length !== 3) return 'expired'

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)

  const expiryDate = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 30) return 'expiring_soon' // 30 days for Part A
  return 'active'
}

// Helper function for Part B status (30-day threshold)
const getPartBStatus = (validTo) => {
  if (!validTo) return 'expired'

  const parts = validTo.split('-')
  if (parts.length !== 3) return 'expired'

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)

  const expiryDate = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 30) return 'expiring_soon' // 30 days for Part B
  return 'active'
}

// Update National Permit status daily at midnight
const updateNationalPermitStatus = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running National Permit status update job...')

    // Get all permits that are not renewed (current permits only)
    const permits = await NationalPermit.find({ isRenewed: false })

    let updatedCount = 0

    for (const permit of permits) {
      let updated = false

      // Calculate Part A status
      const newPartAStatus = getPartAStatus(permit.partAValidTo)
      if (permit.partAStatus !== newPartAStatus) {
        permit.partAStatus = newPartAStatus
        updated = true
      }

      // Calculate Part B status
      const newPartBStatus = getPartBStatus(permit.partBValidTo)
      if (permit.partBStatus !== newPartBStatus) {
        permit.partBStatus = newPartBStatus
        updated = true
      }

      // Save if status changed
      if (updated) {
        await permit.save()
        updatedCount++
      }
    }

    console.log(`✅ National Permit status update completed. Updated ${updatedCount} permits.`)
  } catch (error) {
    console.error('❌ Error updating National Permit status:', error)
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
})

// Export function to initialize cron job
const initNationalPermitStatusCron = () => {
  console.log('✅ National Permit status cron job initialized (runs daily at midnight)')
  return updateNationalPermitStatus
}

module.exports = { initNationalPermitStatusCron, updateNationalPermitStatus }
