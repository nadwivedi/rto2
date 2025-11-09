const cron = require('node-cron')
const Tax = require('../models/Tax')

/**
 * Update tax statuses based on taxTo date
 * - Expired: taxTo date is in the past
 * - Expiring Soon: taxTo date is within 15 days
 * - Active: taxTo date is more than 15 days away
 */
const updateTaxStatuses = async () => {
  try {
    console.log('[CRON] Starting tax status update...')
    const startTime = Date.now()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Build aggregation pipeline to calculate status for all tax records
    const pipeline = [
      {
        $addFields: {
          // Normalize date separator: replace - with /
          taxToNormalized: {
            $replaceAll: {
              input: '$taxTo',
              find: '-',
              replacement: '/'
            }
          }
        }
      },
      {
        $addFields: {
          // Convert taxTo string to date for comparison
          taxToDateParsed: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $arrayElemAt: [{ $split: ['$taxToNormalized', '/'] }, 2] }, // year
                  '-',
                  { $arrayElemAt: [{ $split: ['$taxToNormalized', '/'] }, 1] }, // month
                  '-',
                  { $arrayElemAt: [{ $split: ['$taxToNormalized', '/'] }, 0] }  // day
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
                  case: { $lt: ['$taxToDateParsed', today] },
                  then: 'Expired'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$taxToDateParsed', today] },
                      { $lte: ['$taxToDateParsed', fifteenDaysFromNow] }
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
          receiptNo: 1,
          taxTo: 1
        }
      }
    ]

    const taxRecords = await Tax.aggregate(pipeline)

    if (taxRecords.length === 0) {
      console.log('[CRON] No tax records found to update')
      return
    }

    // Build bulk write operations only for records that need status update
    const bulkOps = []
    let updatedCount = 0
    let skippedCount = 0

    taxRecords.forEach(tax => {
      // Only update if status has changed
      if (tax.status !== tax.computedStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: tax._id },
            update: { $set: { status: tax.computedStatus } }
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    })

    // Execute bulk write if there are updates
    if (bulkOps.length > 0) {
      const result = await Tax.bulkWrite(bulkOps)
      const duration = Date.now() - startTime
      console.log(`[CRON] Tax status update completed in ${duration}ms`)
      console.log(`[CRON] Total tax records: ${taxRecords.length}`)
      console.log(`[CRON] Updated: ${result.modifiedCount}`)
      console.log(`[CRON] Skipped (no change): ${skippedCount}`)
    } else {
      const duration = Date.now() - startTime
      console.log(`[CRON] Tax status update completed in ${duration}ms`)
      console.log(`[CRON] Total tax records: ${taxRecords.length}`)
      console.log(`[CRON] No updates needed - all statuses are current`)
    }

  } catch (error) {
    console.error('[CRON] Error updating tax statuses:', error)
  }
}

/**
 * Initialize cron job
 * Runs every day at midnight (00:00)
 * Also runs immediately on server start to ensure statuses are current
 */
const initTaxStatusCron = () => {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log('[CRON] Running scheduled tax status update...')
    updateTaxStatuses()
  })

  // Run immediately on server start
  console.log('[CRON] Running initial tax status update...')
  updateTaxStatuses()

  console.log('[CRON] Tax status cron job initialized (runs daily at midnight)')
}

module.exports = {
  initTaxStatusCron,
  updateTaxStatuses
}
