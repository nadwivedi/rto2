const cron = require('node-cron')
const Insurance = require('../models/Insurance')

/**
 * Update insurance statuses based on validTo date
 * - Expired: validTo date is in the past
 * - Expiring Soon: validTo date is within 15 days
 * - Active: validTo date is more than 15 days away
 */
const updateInsuranceStatuses = async () => {
  try {
    console.log('[CRON] Starting insurance status update...')
    const startTime = Date.now()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Build aggregation pipeline to calculate status for all insurance policies
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
                  then: 'Expired'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$validToDateParsed', today] },
                      { $lte: ['$validToDateParsed', fifteenDaysFromNow] }
                    ]
                  },
                  then: 'Expiring Soon'
                }
              ],
              default: 'Active'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          computedStatus: 1,
          status: 1,
          policyNumber: 1,
          validTo: 1
        }
      }
    ]

    const insurances = await Insurance.aggregate(pipeline)

    if (insurances.length === 0) {
      console.log('[CRON] No insurance policies found to update')
      return
    }

    // Build bulk write operations only for policies that need status update
    const bulkOps = []
    let updatedCount = 0
    let skippedCount = 0

    insurances.forEach(insurance => {
      // Only update if status has changed
      if (insurance.status !== insurance.computedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: insurance._id },
            update: { $set: { status: insurance.computedStatus } }
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    })

    // Execute bulk write if there are updates
    if (bulkOps.length > 0) {
      const result = await Insurance.bulkWrite(bulkOps)
      const duration = Date.now() - startTime
      console.log(`[CRON] Insurance status update completed in ${duration}ms`)
      console.log(`[CRON] Total policies: ${insurances.length}`)
      console.log(`[CRON] Updated: ${result.modifiedCount}`)
      console.log(`[CRON] Skipped (no change): ${skippedCount}`)
    } else {
      const duration = Date.now() - startTime
      console.log(`[CRON] Insurance status update completed in ${duration}ms`)
      console.log(`[CRON] Total policies: ${insurances.length}`)
      console.log(`[CRON] No updates needed - all statuses are current`)
    }

  } catch (error) {
    console.error('[CRON] Error updating insurance statuses:', error)
  }
}

/**
 * Initialize cron job
 * Runs every day at midnight (00:00)
 * Also runs immediately on server start to ensure statuses are current
 */
const initInsuranceStatusCron = () => {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log('[CRON] Running scheduled insurance status update...')
    updateInsuranceStatuses()
  })

  // Run immediately on server start
  console.log('[CRON] Running initial insurance status update...')
  updateInsuranceStatuses()

  console.log('[CRON] Insurance status cron job initialized (runs daily at midnight)')
}

module.exports = {
  initInsuranceStatusCron,
  updateInsuranceStatuses
}
