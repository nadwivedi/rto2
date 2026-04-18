const cron = require('node-cron')
const WhatsAppSetting = require('../models/WhatsAppSetting')
const MessageLog = require('../models/MessageLog')
const Tax = require('../models/Tax')
const Fitness = require('../models/Fitness')
const Puc = require('../models/Puc')
const Gps = require('../models/Gps')
const Insurance = require('../models/Insurance')

// Helper format date to typical Indian format string 'DD-MM-YYYY' or other normal variants if we strictly compare string
const formatDateToString = (date) => {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return {
    dash: `${d}-${m}-${y}`,
    slash: `${d}/${m}/${y}`,
    iso: `${y}-${m}-${d}`
  }
}

const checkAndQueueAlerts = async () => {
    try {
        console.log('[WHATSAPP-CRON] Starting daily document expiry scanner')
        let setting = await WhatsAppSetting.findOne()
        if (!setting) {
            console.log('[WHATSAPP-CRON] Warning: no settings found, using defaults.')
            setting = {
                daysBeforeExpiry: 7,
                sendOnExpiryDay: true,
                enableGracePeriodAlerts: false,
                gracePeriodDays: []
            }
        }

        const today = new Date()
        
        // 1. Calculate target dates
        const targetDates = []

        // Days Before Expiry Date (e.g. 7 days from now)
        if (setting.daysBeforeExpiry > 0) {
            const beforeDate = new Date(today)
            beforeDate.setDate(today.getDate() + setting.daysBeforeExpiry)
            targetDates.push({ dateObj: beforeDate, type: 'upcoming', diffDays: setting.daysBeforeExpiry })
        }

        // On Expiry Day
        if (setting.sendOnExpiryDay) {
            targetDates.push({ dateObj: today, type: 'today', diffDays: 0 })
        }

        // Grace Period Dates (e.g. 7, 15 days ago)
        if (setting.enableGracePeriodAlerts && setting.gracePeriodDays && setting.gracePeriodDays.length > 0) {
            setting.gracePeriodDays.forEach(days => {
                const pastDate = new Date(today)
                pastDate.setDate(today.getDate() - parseInt(days))
                targetDates.push({ dateObj: pastDate, type: 'grace', diffDays: -days })
            })
        }

        // 2. We process each model
        const models = [
            { name: 'Tax', model: Tax, dateField: 'taxTo' },
            { name: 'Fitness', model: Fitness, dateField: 'validTo' },
            { name: 'Puc', model: Puc, dateField: 'validTo' },
            { name: 'Gps', model: Gps, dateField: 'validTo' },
            { name: 'Insurance', model: Insurance, dateField: 'validTo' }
        ]

        let queuedCount = 0

        for (const { name, model, dateField } of models) {
            for (const targetDate of targetDates) {
                const formats = formatDateToString(targetDate.dateObj)
                const dateValues = [formats.dash, formats.slash, formats.iso]

                // Find documents matching this specific string date in dateField
                const query = {}
                query[dateField] = { $in: dateValues }
                // Exclude empty mobile numbers
                query.mobileNumber = { $exists: true, $ne: '' }

                const matchingDocs = await model.find(query).populate('vehicleNumber')
                
                for (const doc of matchingDocs) {
                    if (!doc.mobileNumber) continue;

                    // Generate dynamic message body
                    const vehicleNo = doc.vehicleNumber?.registrationNumber || doc.vehicleNumber || 'your vehicle'
                    let msg = ''
                    if (targetDate.type === 'upcoming') {
                        msg = `Dear Customer, your ${name} document for vehicle ${vehicleNo} will expire on ${doc[dateField]}. Please renew it soon to avoid penalties.`
                    } else if (targetDate.type === 'today') {
                        msg = `Dear Customer, your ${name} document for vehicle ${vehicleNo} expires TODAY (${doc[dateField]}). Please renew urgently.`
                    } else if (targetDate.type === 'grace') {
                        msg = `Dear Customer, this is a reminder that your ${name} document for vehicle ${vehicleNo} expired on ${doc[dateField]}. The grace period is active. Please renew immediately to avoid heavy fines.`
                    }

                    // Check if already queued for this specific document today to avoid duplicate inserts on multiple overlapping test runs
                    const startOfDay = new Date(today.setHours(0,0,0,0))
                    const endOfDay = new Date(today.setHours(23,59,59,999))
                    const exists = await MessageLog.findOne({
                        documentId: doc._id,
                        documentType: name,
                        createdAt: { $gte: startOfDay, $lte: endOfDay }
                    })

                    if (!exists) {
                        await MessageLog.create({
                            documentId: doc._id,
                            documentType: name,
                            targetNumber: doc.mobileNumber,
                            messageBody: msg,
                            status: 'pending',
                            scheduledFor: new Date()
                        })
                        queuedCount++
                    }
                }
            }
        }

        console.log(`[WHATSAPP-CRON] Expiry scanning completed. Queued ${queuedCount} new alerts.`)
    } catch (err) {
        console.error('[WHATSAPP-CRON] Error checking expiries:', err)
    }
}

const initWhatsAppDailyChecker = () => {
    // Run every day at 08:30 AM
    cron.schedule('30 8 * * *', () => {
        checkAndQueueAlerts()
    })
    console.log('[CRON] WhatsApp Daily Expiry Checker initiated (runs at 08:30 AM)')
}

module.exports = {
    initWhatsAppDailyChecker,
    checkAndQueueAlerts
}
