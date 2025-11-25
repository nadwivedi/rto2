require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Import models
const VehicleRegistration = require('../models/VehicleRegistration')
const User = require('../models/User')

// User ID to assign to all data
const TARGET_USER_ID = new mongoose.Types.ObjectId('691f2e2df6760d2263f575f3')

// Data folder path
const DATA_FOLDER = path.join(__dirname, '..', 'data')

/**
 * Load JSON data from file
 */
function loadJSONData(filename) {
  const filepath = path.join(DATA_FOLDER, filename)
  if (fs.existsSync(filepath)) {
    const rawData = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(rawData)
  }
  return []
}


/**
 * Migrate Vehicle Registrations
 */
async function migrateVehicleRegistrations() {
  console.log('\n🚗 Migrating Vehicle Registrations...')

  const registrations = loadJSONData('Vehicle_Registration_2025-11-20.json')
  console.log(`Found ${registrations.length} vehicle registrations to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const registration of registrations) {
    try {
      // Check if registration already exists by registration number
      const existing = await VehicleRegistration.findOne({ registrationNumber: registration.registrationNumber })
      if (existing) {
        console.log(`  ⚠️  Vehicle ${registration.registrationNumber} already exists, skipping...`)
        continue
      }

      // Create new registration data with new ID (don't use old _id)
      const registrationData = {
        ...registration,
        userId: TARGET_USER_ID
      }

      // Remove old _id and bill reference
      delete registrationData._id
      delete registrationData.__v
      delete registrationData.bill

      await VehicleRegistration.create(registrationData)
      console.log(`  ✅ Migrated vehicle ${registration.registrationNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating vehicle ${registration.registrationNumber}:`, error.message)
      errors.push({ registrationNumber: registration.registrationNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Vehicle Registrations: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}




async function runMigration() {
  console.log('='.repeat(60))
  console.log('🚀 Starting Vehicle Registration Migration')
  console.log('='.repeat(60))
  console.log(`Target User ID: ${TARGET_USER_ID}`)

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get user information
    console.log('\n👤 Fetching user information...')
    const user = await User.findById(TARGET_USER_ID)
    if (!user) {
      throw new Error(`User with ID ${TARGET_USER_ID} not found`)
    }
    console.log(`✅ Found user: ${user.name}`)

    // Migrate Vehicle Registrations
    const results = await migrateVehicleRegistrations()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Vehicle Registrations: ${results.successCount} migrated, ${results.errorCount} errors`)

    if (results.errors && results.errors.length > 0) {
      console.log(`\nErrors:`)
      results.errors.forEach(err => {
        console.log(`  - ${JSON.stringify(err)}`)
      })
    }

    console.log('='.repeat(60))

    if (results.errorCount === 0) {
      console.log('\n✅ Migration completed successfully!')
    } else {
      console.log(`\n⚠️  Migration completed with ${results.errorCount} errors`)
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    // Disconnect from MongoDB
    console.log('\n📡 Disconnecting from MongoDB...')
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })
