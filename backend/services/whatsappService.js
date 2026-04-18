const QRCode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')
const WaSession = require('../models/WaSession')
const path = require('path')
const fs = require('fs')

const AUTH_DATA_PATH = process.env.WHATSAPP_AUTH_DIR || '.wwebjs_auth'

class WhatsappService {
  constructor () {
    this.client = null;
    this.sessionRecordId = null;
    this.starting = false;
    // "stopped" flag: if true, cron sender skips sending
    this.isStopped = false;
  }

  async getMasterSessionId() {
    let session = await WaSession.findOne()
    if (!session) {
      session = await WaSession.create({ sessionId: 'rto_system' })
    }
    return session._id
  }

  async updateStatus(status, updateData = {}) {
    if (!this.sessionRecordId) {
      this.sessionRecordId = await this.getMasterSessionId()
    }
    await WaSession.findByIdAndUpdate(this.sessionRecordId, {
      status,
      ...updateData
    })
    console.log(`[WHATSAPP] Status -> ${status}`)
  }

  async startClient() {
    // Already running
    if (this.client) {
      console.log('[WHATSAPP] Client already running.')
      return
    }
    // Prevent double-start race
    if (this.starting) {
      console.log('[WHATSAPP] Already starting, skipping.')
      return
    }

    this.starting = true
    this.isStopped = false
    this.sessionRecordId = await this.getMasterSessionId()
    await this.updateStatus('initializing', { qrCodeDataUrl: null, lastError: null })

    console.log('[WHATSAPP] Creating WhatsApp client...')

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'rto_system_admin',
        dataPath: AUTH_DATA_PATH
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    })

    client.on('qr', async (qr) => {
      try {
        console.log('[WHATSAPP] QR code received')
        const qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 300 })
        await this.updateStatus('qr_ready', { qrCodeDataUrl, lastError: null })
      } catch (error) {
        console.error('[WHATSAPP] QR Code Error:', error.message)
      }
    })

    client.on('loading_screen', (percent, message) => {
      console.log(`[WHATSAPP] Loading: ${percent}% - ${message}`)
    })

    client.on('authenticated', async () => {
      console.log('[WHATSAPP] Authenticated! Session saved. Waiting for ready...')
      // Keep initializing status — ready event will set it to authenticated
    })

    client.on('ready', async () => {
      // Assign client only after fully ready so status checks are reliable
      this.client = client
      this.starting = false
      const phoneNumber = client?.info?.wid?.user || null
      console.log(`[WHATSAPP] ✅ READY! Phone: ${phoneNumber}`)
      await this.updateStatus('authenticated', {
        qrCodeDataUrl: null,
        phoneNumber,
        lastConnectedAt: new Date(),
        lastError: null
      })
    })

    client.on('auth_failure', async msg => {
      console.error('[WHATSAPP] Auth failure:', msg)
      this.client = null
      this.starting = false
      await this.updateStatus('auth_failure', { lastError: String(msg) })
    })

    client.on('disconnected', async (reason) => {
      console.log('[WHATSAPP] Disconnected:', reason)
      this.client = null
      this.starting = false
      await this.updateStatus('disconnected', { qrCodeDataUrl: null, lastError: String(reason) })
    })

    // Non-blocking initialize — events drive state changes
    client.initialize().catch(async (error) => {
      console.error('[WHATSAPP] Initialize error:', error.message)
      this.client = null
      this.starting = false
      await this.updateStatus('disconnected', { lastError: error.message })
    })
  }

  /**
   * STOP: Destroys the browser session but keeps auth data on disk.
   * Next startClient() call won't need QR scan.
   * Also sets isStopped = true to pause cron message sender.
   */
  async stopClient() {
    console.log('[WHATSAPP] Stopping client (keeping session on disk)...')
    this.isStopped = true
    if (this.client) {
      try {
        await this.client.destroy()
      } catch (err) {
        console.log('[WHATSAPP] Destroy error (ignored):', err.message)
      }
      this.client = null
      this.starting = false
    }
    if (this.sessionRecordId) {
      await this.updateStatus('disconnected', { qrCodeDataUrl: null, lastError: 'Manually stopped' })
    }
  }

  /**
   * LOGOUT: Destroys the browser AND clears saved auth data from disk.
   * Next startClient() will need a fresh QR scan.
   */
  async logoutClient() {
    console.log('[WHATSAPP] Logging out and clearing session data...')
    this.isStopped = true
    if (this.client) {
      try {
        await this.client.logout()
      } catch (err) {
        console.log('[WHATSAPP] Logout error (ignored):', err.message)
      }
      try {
        await this.client.destroy()
      } catch (err) {
        // ignore
      }
      this.client = null
      this.starting = false
    }

    // Also delete the LocalAuth directory from disk to force fresh QR
    try {
      const authDir = path.join(AUTH_DATA_PATH, 'session-rto_system_admin')
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true })
        console.log('[WHATSAPP] Auth session data cleared from disk.')
      }
    } catch (err) {
      console.error('[WHATSAPP] Failed to clear auth data:', err.message)
    }

    await this.updateStatus('disconnected', { qrCodeDataUrl: null, phoneNumber: null, lastError: null })
  }

  async getStatus() {
    const sessionRecordId = await this.getMasterSessionId()
    return await WaSession.findById(sessionRecordId)
  }

  isClientConnected() {
    return !!this.client && !this.isStopped
  }

  // Used by Cron
  async sendMessage(targetNumber, text) {
    if (this.isStopped) {
      throw new Error("Message sending is paused (stopped). Resume the session first.")
    }
    if (!this.client) {
      throw new Error("WhatsApp client not initialized.")
    }

    const state = await this.client.getState().catch(() => null)
    if (state !== 'CONNECTED') {
      throw new Error(`WhatsApp client is not connected. State: ${state}`)
    }

    let formattedNumber = targetNumber.replace(/\D/g, '')
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber
    }
    const chatId = `${formattedNumber}@c.us`

    const isRegistered = await this.client.isRegisteredUser(chatId)
    if (!isRegistered) {
      throw new Error(`Number ${formattedNumber} is not registered on WhatsApp`)
    }

    const result = await this.client.sendMessage(chatId, text)
    return { success: true, messageId: result?.id?._serialized }
  }
}

module.exports = new WhatsappService()
