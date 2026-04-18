const cron = require('node-cron')
const WhatsAppSetting = require('../models/WhatsAppSetting')
const MessageLog = require('../models/MessageLog')
const whatsappService = require('../services/whatsappService')

const sendPendingMessages = async () => {
    try {
        console.log('[WHATSAPP-SENDER] Checking for pending messages...')

        let setting = await WhatsAppSetting.findOne()
        const maxPerDay = setting ? setting.maxMessagesPerDay : 20
        const maxPerHour = setting ? setting.maxMessagesPerHour : 3

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        
        // Count how many sent today
        const sentTodayCount = await MessageLog.countDocuments({
            status: 'sent',
            sentAt: { $gte: startOfDay }
        })

        if (sentTodayCount >= maxPerDay) {
            console.log(`[WHATSAPP-SENDER] Daily limit reached (${sentTodayCount}/${maxPerDay}). Skipping.`)
            return
        }

        const remainingQuota = maxPerDay - sentTodayCount
        const limitToFetch = Math.min(maxPerHour, remainingQuota)

        if (limitToFetch <= 0) return;

        // Fetch up to 'limitToFetch' pending messages
        const messages = await MessageLog.find({
            status: 'pending',
            scheduledFor: { $lte: new Date() }
        }).sort({ scheduledFor: 1 }).limit(limitToFetch)

        if (messages.length === 0) {
            // Nothing to do
            return
        }

        console.log(`[WHATSAPP-SENDER] Found ${messages.length} pending messages. Attempting to send...`)

        for (const msg of messages) {
            try {
                // Actual send call
                const result = await whatsappService.sendMessage(msg.targetNumber, msg.messageBody)
                
                msg.status = 'sent'
                msg.sentAt = new Date()
                msg.whatsappMessageId = result.messageId
                await msg.save()
                console.log(`[WHATSAPP-SENDER] Successfully sent message to ${msg.targetNumber}`)
                
                // small delay between sends just to be safe
                await new Promise(r => setTimeout(r, 2000))
            } catch (err) {
                console.error(`[WHATSAPP-SENDER] Failed to send message to ${msg.targetNumber}:`, err.message)
                msg.status = 'failed'
                msg.errorReason = err.message
                await msg.save()
            }
        }
    } catch (error) {
        console.error('[WHATSAPP-SENDER] Error in message sender:', error)
    }
}

const initWhatsAppMessageSender = () => {
    // Run at the beginning of every hour (e.g. 09:00, 10:00, etc)
    cron.schedule('0 * * * *', () => {
        sendPendingMessages()
    })
    console.log('[CRON] WhatsApp Message Sender initiated (runs every hour)')
}

module.exports = {
    initWhatsAppMessageSender,
    sendPendingMessages
}
