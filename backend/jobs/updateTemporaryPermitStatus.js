const cron = require('node-cron')
const TemporaryPermit = require('../models/TemporaryPermit')

/**
 * Update temporary permit statuses based on validTo date
 * - expired: validTo date is in the past
 * - expiring_soon: validTo date is within 15 days
 * - active: validTo date is more than 15 days away
 */
const updateTemporaryPermitStatuses = async () => {
  try {
    console.log('[CRON] Starting temporary permit status update...')
    const startTime = Date.now()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Build aggregation pipeline to calculate status for all permits
    const pipeline = [
      {
        $addFields: {
          // Normalize date separator: replace - with /
          validToNormalized: {
            $replaceAll: {
              input: '$validTo',
              find: '-',
              replacement: '/'
            }
          }
        }
      },
      {
        $addFields: {
          // Convert validTo string to date for comparison
          validToDateParsed: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 2] }, // year
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 1] }, // month
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 0] }  // day
                ]
              },
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $addFields: {
          computedStatus: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$validToDateParsed', today] },
                  then: 'expired'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$validToDateParsed', today] },
                      { $lte: ['$validToDateParsed', fifteenDaysFromNow] }
                    ]
                  },
                  then: 'expiring_soon'
                }
              ],
              default: 'active'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          computedStatus: 1,
          status: 1,
          permitNumber: 1,
          validTo: 1
        }
      }
    ]

    const permits = await TemporaryPermit.aggregate(pipeline)

    if (permits.length === 0) {
      console.log('[CRON] No temporary permits found to update')
      return
    }

    // Build bulk write operations only for permits that need status update
    const bulkOps = []
    let updatedCount = 0
    let skippedCount = 0

    permits.forEach(permit => {
      // Only update if status has changed
      if (permit.status !== permit.computedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: permit._id },
            update: { $set: { status: permit.computedStatus } }
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    })

    // Execute bulk write if there are updates
    if (bulkOps.length > 0) {
      const result = await TemporaryPermit.bulkWrite(bulkOps)
      const duration = Date.now() - startTime
      console.log(`[CRON] Temporary permit status update completed in ${duration}ms`)
      console.log(`[CRON] Total permits: ${permits.length}`)
      console.log(`[CRON] Updated: ${result.modifiedCount}`)
      console.log(`[CRON] Skipped (no change): ${skippedCount}`)
    } else {
      const duration = Date.now() - startTime
      console.log(`[CRON] Temporary permit status update completed in ${duration}ms`)
      console.log(`[CRON] Total permits: ${permits.length}`)
      console.log(`[CRON] No updates needed - all statuses are current`)
    }

  } catch (error) {
    console.error('[CRON] Error updating temporary permit statuses:', error)
  }
}

/**
 * Initialize cron job
 * Runs every day at midnight (00:00)
 * Also runs immediately on server start to ensure statuses are current
 */
const initTemporaryPermitStatusCron = () => {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log('[CRON] Running scheduled temporary permit status update...')
    updateTemporaryPermitStatuses()
  })

  // Run immediately on server start
  console.log('[CRON] Running initial temporary permit status update...')
  updateTemporaryPermitStatuses()

  console.log('[CRON] Temporary permit status cron job initialized (runs daily at midnight)')
}

module.exports = {
  initTemporaryPermitStatusCron,
  updateTemporaryPermitStatuses
}
