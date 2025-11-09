const cron = require('node-cron')
const Fitness = require('../models/Fitness')

/**
 * Update fitness statuses based on validTo date
 * - Expired: validTo date is in the past
 * - Expiring Soon: validTo date is within 15 days
 * - Active: validTo date is more than 15 days away
 */
const updateFitnessStatuses = async () => {
  try {
    console.log('[CRON] Starting fitness status update...')
    const startTime = Date.now()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Build aggregation pipeline to calculate status for all fitness records
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
          vehicleNumber: 1,
          validTo: 1
        }
      }
    ]

    const fitnessRecords = await Fitness.aggregate(pipeline)

    if (fitnessRecords.length === 0) {
      console.log('[CRON] No fitness records found to update')
      return
    }

    // Build bulk write operations only for records that need status update
    const bulkOps = []
    let updatedCount = 0
    let skippedCount = 0

    fitnessRecords.forEach(fitness => {
      // Only update if status has changed
      if (fitness.status !== fitness.computedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: fitness._id },
            update: { $set: { status: fitness.computedStatus } }
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    })

    // Execute bulk write if there are updates
    if (bulkOps.length > 0) {
      const result = await Fitness.bulkWrite(bulkOps)
      const duration = Date.now() - startTime
      console.log(`[CRON] Fitness status update completed in ${duration}ms`)
      console.log(`[CRON] Total fitness records: ${fitnessRecords.length}`)
      console.log(`[CRON] Updated: ${result.modifiedCount}`)
      console.log(`[CRON] Skipped (no change): ${skippedCount}`)
    } else {
      const duration = Date.now() - startTime
      console.log(`[CRON] Fitness status update completed in ${duration}ms`)
      console.log(`[CRON] Total fitness records: ${fitnessRecords.length}`)
      console.log(`[CRON] No updates needed - all statuses are current`)
    }

  } catch (error) {
    console.error('[CRON] Error updating fitness statuses:', error)
  }
}

/**
 * Initialize cron job
 * Runs every day at midnight (00:00)
 * Also runs immediately on server start to ensure statuses are current
 */
const initFitnessStatusCron = () => {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log('[CRON] Running scheduled fitness status update...')
    updateFitnessStatuses()
  })

  // Run immediately on server start
  console.log('[CRON] Running initial fitness status update...')
  updateFitnessStatuses()

  console.log('[CRON] Fitness status cron job initialized (runs daily at midnight)')
}

module.exports = {
  initFitnessStatusCron,
  updateFitnessStatuses
}
