const cron = require('node-cron')
const Puc = require('../models/Puc')

/**
 * Update PUC statuses based on validTo date
 * - Expired: validTo date is in the past
 * - Expiring Soon: validTo date is within 30 days
 * - Active: validTo date is more than 30 days away
 */
const updatePucStatuses = async () => {
  try {
    console.log('[CRON] Starting PUC status update...')
    const startTime = Date.now()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    thirtyDaysFromNow.setHours(23, 59, 59, 999)

    // Build aggregation pipeline to calculate status for all PUC records
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
                      { $lte: ['$validToDateParsed', thirtyDaysFromNow] }
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
          vehicleNumber: 1,
          validTo: 1
        }
      }
    ]

    const pucRecords = await Puc.aggregate(pipeline)

    if (pucRecords.length === 0) {
      console.log('[CRON] No PUC records found to update')
      return
    }

    // Build bulk write operations only for records that need status update
    const bulkOps = []
    let updatedCount = 0
    let skippedCount = 0

    pucRecords.forEach(puc => {
      // Only update if status has changed
      if (puc.status !== puc.computedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: puc._id },
            update: { $set: { status: puc.computedStatus } }
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    })

    // Execute bulk write if there are updates
    if (bulkOps.length > 0) {
      const result = await Puc.bulkWrite(bulkOps)
      const duration = Date.now() - startTime
      console.log(`[CRON] PUC status update completed in ${duration}ms`)
      console.log(`[CRON] Total PUC records: ${pucRecords.length}`)
      console.log(`[CRON] Updated: ${result.modifiedCount}`)
      console.log(`[CRON] Skipped (no change): ${skippedCount}`)
    } else {
      const duration = Date.now() - startTime
      console.log(`[CRON] PUC status update completed in ${duration}ms`)
      console.log(`[CRON] Total PUC records: ${pucRecords.length}`)
      console.log(`[CRON] No updates needed - all statuses are current`)
    }

  } catch (error) {
    console.error('[CRON] Error updating PUC statuses:', error)
  }
}

/**
 * Initialize cron job
 * Runs every day at midnight (00:00)
 * Also runs immediately on server start to ensure statuses are current
 */
const initPucStatusCron = () => {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log('[CRON] Running scheduled PUC status update...')
    updatePucStatuses()
  })

  // Run immediately on server start
  console.log('[CRON] Running initial PUC status update...')
  updatePucStatuses()

  console.log('[CRON] PUC status cron job initialized (runs daily at midnight)')
}

module.exports = {
  initPucStatusCron,
  updatePucStatuses
}
