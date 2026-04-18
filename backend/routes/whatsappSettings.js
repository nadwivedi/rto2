const express = require('express')
const router = express.Router()
const WhatsAppSetting = require('../models/WhatsAppSetting')

// Middleware to get current user ID. Since this depends on an auth system,
// adjust according to actual authentication implementation.
// Assuming req.user is populated by a middleware, or just fallback.

router.get('/', async (req, res) => {
  try {
    // if using multi-tenant this would be req.user.id
    // here we simplify to fetch the primary one or first one
    let setting = await WhatsAppSetting.findOne()
    if (!setting) {
      // Create default
      // Note: we are passing a fake userId just to map to the unique required field if multitenancy isn't strictly enforced right here
      const firstUser = await require('../models/User').findOne()
      setting = await WhatsAppSetting.create({
        userId: firstUser ? firstUser._id : new require('mongoose').Types.ObjectId()
      })
    }
    res.json(setting)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const {
      daysBeforeExpiry,
      sendOnExpiryDay,
      enableGracePeriodAlerts,
      gracePeriodDays,
      maxMessagesPerDay,
      maxMessagesPerHour
    } = req.body

    let setting = await WhatsAppSetting.findOne()
    if (!setting) {
      const firstUser = await require('../models/User').findOne()
      setting = new WhatsAppSetting({ userId: firstUser ? firstUser._id : new require('mongoose').Types.ObjectId() })
    }

    if (daysBeforeExpiry !== undefined) setting.daysBeforeExpiry = daysBeforeExpiry
    if (sendOnExpiryDay !== undefined) setting.sendOnExpiryDay = sendOnExpiryDay
    if (enableGracePeriodAlerts !== undefined) setting.enableGracePeriodAlerts = enableGracePeriodAlerts
    if (gracePeriodDays !== undefined) setting.gracePeriodDays = gracePeriodDays
    if (maxMessagesPerDay !== undefined) setting.maxMessagesPerDay = maxMessagesPerDay
    if (maxMessagesPerHour !== undefined) setting.maxMessagesPerHour = maxMessagesPerHour

    await setting.save()
    res.json(setting)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
