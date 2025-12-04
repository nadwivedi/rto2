const cron = require('node-cron')
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')
const transporter = require('../utils/nodemailer')

const User = require('../models/User')
const VehicleRegistration = require('../models/VehicleRegistration')
const DrivingLicense = require('../models/Driving')
const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')
const CgPermit = require('../models/CgPermit')
const TemporaryPermit = require('../models/TemporaryPermit')
const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const Fitness = require('../models/Fitness')
const Tax = require('../models/Tax')
const Insurance = require('../models/Insurance')
const Puc = require('../models/Puc')
const VehicleTransfer = require('../models/vehicleTransfer')
const CustomBill = require('../models/CustomBill')

/**
 * Create a ZIP file with all data combined
 */
const createCombinedZip = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[EXPORT] Fetching all data for combined export...')

      // Fetch all data
      const users = await User.find({}).select('-password').lean()
      const vehicleRegistrations = await VehicleRegistration.find({}).populate('userId', 'name mobile1').lean()
      const drivingLicenses = await DrivingLicense.find({}).populate('userId', 'name mobile1').lean()
      const nationalPermitsPartA = await NationalPermitPartA.find({}).populate('userId', 'name mobile1').lean()
      const nationalPermitsPartB = await NationalPermitPartB.find({}).populate('userId', 'name mobile1').lean()
      const cgPermits = await CgPermit.find({}).populate('userId', 'name mobile1').lean()
      const temporaryPermits = await TemporaryPermit.find({}).populate('userId', 'name mobile1').lean()
      const temporaryPermitsOtherState = await TemporaryPermitOtherState.find({}).populate('userId', 'name mobile1').lean()
      const fitness = await Fitness.find({}).populate('userId', 'name mobile1').lean()
      const taxes = await Tax.find({}).populate('userId', 'name mobile1').lean()
      const insurances = await Insurance.find({}).populate('userId', 'name mobile1').lean()
      const pucs = await Puc.find({}).populate('userId', 'name mobile1').lean()
      const vehicleTransfers = await VehicleTransfer.find({}).populate('userId', 'name mobile1').lean()
      const customBills = await CustomBill.find({}).populate('userId', 'name mobile1').lean()

      console.log(`[EXPORT] Found ${users.length} users and related data`)

      // Create timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `rto_all_data_combined_${timestamp}.zip`
      const filepath = path.join(__dirname, '..', 'temp', filename)

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '..', 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Create write stream
      const output = fs.createWriteStream(filepath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      // Handle archive errors
      archive.on('error', (err) => {
        console.error('[EXPORT] Archive error:', err)
        reject(err)
      })

      // Handle stream close
      output.on('close', () => {
        console.log(`[EXPORT] Combined ZIP created: ${archive.pointer()} bytes`)
        resolve(filepath)
      })

      // Pipe archive to file
      archive.pipe(output)

      // Add JSON files to archive
      archive.append(JSON.stringify(users, null, 2), { name: 'users.json' })
      archive.append(JSON.stringify(vehicleRegistrations, null, 2), { name: 'vehicle_registrations.json' })
      archive.append(JSON.stringify(drivingLicenses, null, 2), { name: 'driving_licenses.json' })
      archive.append(JSON.stringify(nationalPermitsPartA, null, 2), { name: 'national_permits_part_a.json' })
      archive.append(JSON.stringify(nationalPermitsPartB, null, 2), { name: 'national_permits_part_b.json' })
      archive.append(JSON.stringify(cgPermits, null, 2), { name: 'cg_permits.json' })
      archive.append(JSON.stringify(temporaryPermits, null, 2), { name: 'temporary_permits.json' })
      archive.append(JSON.stringify(temporaryPermitsOtherState, null, 2), { name: 'temporary_permits_other_state.json' })
      archive.append(JSON.stringify(fitness, null, 2), { name: 'fitness_certificates.json' })
      archive.append(JSON.stringify(taxes, null, 2), { name: 'tax_records.json' })
      archive.append(JSON.stringify(insurances, null, 2), { name: 'insurance_records.json' })
      archive.append(JSON.stringify(pucs, null, 2), { name: 'puc_records.json' })
      archive.append(JSON.stringify(vehicleTransfers, null, 2), { name: 'vehicle_transfers.json' })
      archive.append(JSON.stringify(customBills, null, 2), { name: 'custom_bills.json' })

      // Finalize archive
      await archive.finalize()
    } catch (error) {
      console.error('[EXPORT] Error creating combined ZIP:', error)
      reject(error)
    }
  })
}

/**
 * Create a ZIP file with user-wise organization
 */
const createUserWiseZip = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[EXPORT] Fetching all data for user-wise export...')

      // Fetch all users
      const users = await User.find({}).select('-password').lean()
      console.log(`[EXPORT] Found ${users.length} users`)

      // Create timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `rto_all_data_user_wise_${timestamp}.zip`
      const filepath = path.join(__dirname, '..', 'temp', filename)

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '..', 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Create write stream
      const output = fs.createWriteStream(filepath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      // Handle archive errors
      archive.on('error', (err) => {
        console.error('[EXPORT] Archive error:', err)
        reject(err)
      })

      // Handle stream close
      output.on('close', () => {
        console.log(`[EXPORT] User-wise ZIP created: ${archive.pointer()} bytes`)
        resolve(filepath)
      })

      // Pipe archive to file
      archive.pipe(output)

      // Process each user
      for (const user of users) {
        const userId = user._id
        const folderName = `user_${user.mobile1}_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}`

        // Fetch all data for this user
        const vehicleRegistrations = await VehicleRegistration.find({ userId }).lean()
        const drivingLicenses = await DrivingLicense.find({ userId }).lean()
        const nationalPermitsPartA = await NationalPermitPartA.find({ userId }).lean()
        const nationalPermitsPartB = await NationalPermitPartB.find({ userId }).lean()
        const cgPermits = await CgPermit.find({ userId }).lean()
        const temporaryPermits = await TemporaryPermit.find({ userId }).lean()
        const temporaryPermitsOtherState = await TemporaryPermitOtherState.find({ userId }).lean()
        const fitness = await Fitness.find({ userId }).lean()
        const taxes = await Tax.find({ userId }).lean()
        const insurances = await Insurance.find({ userId }).lean()
        const pucs = await Puc.find({ userId }).lean()
        const vehicleTransfers = await VehicleTransfer.find({ userId }).lean()
        const customBills = await CustomBill.find({ userId }).lean()

        // Add user info file
        archive.append(JSON.stringify(user, null, 2), { name: `${folderName}/user_info.json` })

        // Add data files if they exist
        if (vehicleRegistrations.length > 0) {
          archive.append(JSON.stringify(vehicleRegistrations, null, 2), { name: `${folderName}/vehicle_registrations.json` })
        }
        if (drivingLicenses.length > 0) {
          archive.append(JSON.stringify(drivingLicenses, null, 2), { name: `${folderName}/driving_licenses.json` })
        }
        if (nationalPermitsPartA.length > 0) {
          archive.append(JSON.stringify(nationalPermitsPartA, null, 2), { name: `${folderName}/national_permits_part_a.json` })
        }
        if (nationalPermitsPartB.length > 0) {
          archive.append(JSON.stringify(nationalPermitsPartB, null, 2), { name: `${folderName}/national_permits_part_b.json` })
        }
        if (cgPermits.length > 0) {
          archive.append(JSON.stringify(cgPermits, null, 2), { name: `${folderName}/cg_permits.json` })
        }
        if (temporaryPermits.length > 0) {
          archive.append(JSON.stringify(temporaryPermits, null, 2), { name: `${folderName}/temporary_permits.json` })
        }
        if (temporaryPermitsOtherState.length > 0) {
          archive.append(JSON.stringify(temporaryPermitsOtherState, null, 2), { name: `${folderName}/temporary_permits_other_state.json` })
        }
        if (fitness.length > 0) {
          archive.append(JSON.stringify(fitness, null, 2), { name: `${folderName}/fitness_certificates.json` })
        }
        if (taxes.length > 0) {
          archive.append(JSON.stringify(taxes, null, 2), { name: `${folderName}/tax_records.json` })
        }
        if (insurances.length > 0) {
          archive.append(JSON.stringify(insurances, null, 2), { name: `${folderName}/insurance_records.json` })
        }
        if (pucs.length > 0) {
          archive.append(JSON.stringify(pucs, null, 2), { name: `${folderName}/puc_records.json` })
        }
        if (vehicleTransfers.length > 0) {
          archive.append(JSON.stringify(vehicleTransfers, null, 2), { name: `${folderName}/vehicle_transfers.json` })
        }
        if (customBills.length > 0) {
          archive.append(JSON.stringify(customBills, null, 2), { name: `${folderName}/custom_bills.json` })
        }
      }

      // Finalize archive
      await archive.finalize()
    } catch (error) {
      console.error('[EXPORT] Error creating user-wise ZIP:', error)
      reject(error)
    }
  })
}

/**
 * Send email with ZIP attachments
 */
const sendExportEmail = async (combinedZipPath, userWiseZipPath) => {
  try {
    console.log('[EMAIL] Preparing to send export email...')

    const mailOptions = {
      from: 'desinplus1@gmail.com',
      to: 'rtosarthi@gmail.com',
      subject: `RTO Sarthi - Daily Data Backup - ${new Date().toLocaleDateString('en-IN')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">RTO Sarthi - Daily Data Backup</h2>
          <p>Hello,</p>
          <p>This is your automated daily data backup from RTO Sarthi system.</p>

          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Backup Contents:</h3>
            <ul style="color: #6B7280;">
              <li><strong>Combined ZIP:</strong> All data in separate JSON files</li>
              <li><strong>User-Wise ZIP:</strong> Data organized by user folders</li>
            </ul>
          </div>

          <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1E40AF;">Data Summary:</h3>
            <p style="color: #3B82F6; margin: 5px 0;">Backup Date: <strong>${new Date().toLocaleString('en-IN')}</strong></p>
            <p style="color: #6B7280; font-size: 12px; margin-top: 10px;">
              Both ZIP files are attached to this email.
            </p>
          </div>

          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(combinedZipPath),
          path: combinedZipPath
        },
        {
          filename: path.basename(userWiseZipPath),
          path: userWiseZipPath
        }
      ]
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('[EMAIL] Export email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('[EMAIL] Error sending export email:', error)
    throw error
  }
}

/**
 * Clean up temporary files
 */
const cleanupTempFiles = (files) => {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        console.log(`[CLEANUP] Deleted temp file: ${path.basename(file)}`)
      }
    } catch (error) {
      console.error(`[CLEANUP] Error deleting file ${file}:`, error)
    }
  })
}

/**
 * Main export and email function
 */
const exportAndEmailData = async () => {
  console.log('[CRON] Starting data export and email job...')
  const startTime = Date.now()

  let combinedZipPath = null
  let userWiseZipPath = null

  try {
    // Create both ZIP files
    combinedZipPath = await createCombinedZip()
    userWiseZipPath = await createUserWiseZip()

    // Send email with attachments
    await sendExportEmail(combinedZipPath, userWiseZipPath)

    const duration = Date.now() - startTime
    console.log(`[CRON] Data export and email completed successfully in ${duration}ms`)
  } catch (error) {
    console.error('[CRON] Error in export and email job:', error)
  } finally {
    // Clean up temporary files
    if (combinedZipPath || userWiseZipPath) {
      cleanupTempFiles([combinedZipPath, userWiseZipPath].filter(Boolean))
    }
  }
}

/**
 * Initialize cron job
 * Runs every day at 2:00 AM
 * Also runs immediately on server restart
 */
const initEmailDataExportCron = () => {
  // Schedule: Every day at 2:00 AM
  // Format: second minute hour day month dayOfWeek
  cron.schedule('0 0 2 * * *', () => {
    console.log('[CRON] Running scheduled data export and email...')
    exportAndEmailData()
  })

  // Run immediately on server start/restart
  console.log('[CRON] Running initial data export and email on server restart...')
  exportAndEmailData()

  console.log('[CRON] Email data export cron job initialized (runs daily at 2:00 AM and on server restart)')
}

module.exports = {
  initEmailDataExportCron,
  exportAndEmailData
}
