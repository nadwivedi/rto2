require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Import models
const CustomBill = require('../models/CustomBill')
const VehicleRegistration = require('../models/VehicleRegistration')
const Driving = require('../models/Driving')
const Fitness = require('../models/Fitness')
const Tax = require('../models/Tax')
const CgPermit = require('../models/CgPermit')
const TemporaryPermit = require('../models/TemporaryPermit')
const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')
const VehicleTransfer = require('../models/vehicleTransfer')
const User = require('../models/User')

// Import PDF generator
const { generateCustomBillPDF } = require('../utils/customBillGenerator')

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
 * Migrate Custom Bills and generate PDFs
 */
async function migrateCustomBills(userInfo) {
  console.log('\n📄 Migrating Custom Bills...')

  const bills = loadJSONData('Custom_Bills_2025-11-20.json')
  console.log(`Found ${bills.length} custom bills to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const bill of bills) {
    try {
      // Check if bill already exists
      const existingBill = await CustomBill.findOne({ _id: bill._id })
      if (existingBill) {
        console.log(`  ⚠️  Bill ${bill.billNumber} already exists, skipping...`)
        continue
      }

      // Create bill with userId
      const billData = {
        ...bill,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(bill._id)
      }

      // Remove old PDF path to regenerate
      delete billData.billPdfPath

      const newBill = await CustomBill.create(billData)

      // Generate PDF
      console.log(`  📝 Generating PDF for bill ${newBill.billNumber}...`)
      const pdfPath = await generateCustomBillPDF(newBill, userInfo)

      // Update bill with PDF path
      await CustomBill.findByIdAndUpdate(newBill._id, { billPdfPath: pdfPath })

      console.log(`  ✅ Migrated bill ${newBill.billNumber} with PDF`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating bill ${bill.billNumber}:`, error.message)
      errors.push({ billNumber: bill.billNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Custom Bills: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
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
      // Check if registration already exists
      const existing = await VehicleRegistration.findOne({ _id: registration._id })
      if (existing) {
        console.log(`  ⚠️  Vehicle ${registration.registrationNumber} already exists, skipping...`)
        continue
      }

      const registrationData = {
        ...registration,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(registration._id)
      }

      // Remove bill reference (old model)
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

/**
 * Migrate Driving Licenses
 */
async function migrateDrivingLicenses() {
  console.log('\n🪪 Migrating Driving Licenses...')

  const licenses = loadJSONData('Driving_License_2025-11-20.json')
  console.log(`Found ${licenses.length} driving licenses to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const license of licenses) {
    try {
      // Check if license already exists
      const existing = await Driving.findOne({ _id: license._id })
      if (existing) {
        console.log(`  ⚠️  License ${license.name} already exists, skipping...`)
        continue
      }

      const licenseData = {
        ...license,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(license._id)
      }

      // Remove bill reference (old model)
      delete licenseData.bill

      await Driving.create(licenseData)
      console.log(`  ✅ Migrated license for ${license.name}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating license ${license.name}:`, error.message)
      errors.push({ name: license.name, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Driving Licenses: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate Fitness Records
 */
async function migrateFitnessRecords() {
  console.log('\n🔧 Migrating Fitness Records...')

  const records = loadJSONData('Fitness_2025-11-20.json')
  console.log(`Found ${records.length} fitness records to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const record of records) {
    try {
      // Check if record already exists
      const existing = await Fitness.findOne({ _id: record._id })
      if (existing) {
        console.log(`  ⚠️  Fitness for ${record.vehicleNumber} already exists, skipping...`)
        continue
      }

      const recordData = {
        ...record,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(record._id)
      }

      // Remove bill reference (old model)
      delete recordData.bill

      await Fitness.create(recordData)
      console.log(`  ✅ Migrated fitness for ${record.vehicleNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating fitness ${record.vehicleNumber}:`, error.message)
      errors.push({ vehicleNumber: record.vehicleNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Fitness Records: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate Tax Records
 */
async function migrateTaxRecords() {
  console.log('\n💰 Migrating Tax Records...')

  const records = loadJSONData('Tax_2025-11-20.json')
  console.log(`Found ${records.length} tax records to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const record of records) {
    try {
      // Check if record already exists
      const existing = await Tax.findOne({ _id: record._id })
      if (existing) {
        console.log(`  ⚠️  Tax for ${record.vehicleNumber} already exists, skipping...`)
        continue
      }

      const recordData = {
        ...record,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(record._id)
      }

      // Remove bill reference (old model)
      delete recordData.bill

      await Tax.create(recordData)
      console.log(`  ✅ Migrated tax for ${record.vehicleNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating tax ${record.vehicleNumber}:`, error.message)
      errors.push({ vehicleNumber: record.vehicleNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Tax Records: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate CG Permits
 */
async function migrateCGPermits() {
  console.log('\n📋 Migrating CG Permits...')

  const permits = loadJSONData('CG_Permit_2025-11-20.json')
  console.log(`Found ${permits.length} CG permits to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const permit of permits) {
    try {
      // Check if permit already exists
      const existing = await CgPermit.findOne({ _id: permit._id })
      if (existing) {
        console.log(`  ⚠️  CG Permit ${permit.permitNumber} already exists, skipping...`)
        continue
      }

      const permitData = {
        ...permit,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(permit._id)
      }

      // Remove bill reference (old model)
      delete permitData.bill

      await CgPermit.create(permitData)
      console.log(`  ✅ Migrated CG permit ${permit.permitNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating CG permit ${permit.permitNumber}:`, error.message)
      errors.push({ permitNumber: permit.permitNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ CG Permits: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate Temporary Permits
 */
async function migrateTemporaryPermits() {
  console.log('\n📝 Migrating Temporary Permits...')

  const permits = loadJSONData('Temporary_Permit_2025-11-20.json')
  console.log(`Found ${permits.length} temporary permits to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const permit of permits) {
    try {
      // Check if permit already exists
      const existing = await TemporaryPermit.findOne({ _id: permit._id })
      if (existing) {
        console.log(`  ⚠️  Temporary Permit ${permit.permitNumber} already exists, skipping...`)
        continue
      }

      const permitData = {
        ...permit,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(permit._id)
      }

      // Remove bill reference (old model)
      delete permitData.bill

      await TemporaryPermit.create(permitData)
      console.log(`  ✅ Migrated temporary permit ${permit.permitNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating temporary permit ${permit.permitNumber}:`, error.message)
      errors.push({ permitNumber: permit.permitNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Temporary Permits: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate Temporary Permits Other State
 */
async function migrateTemporaryPermitsOtherState() {
  console.log('\n📝 Migrating Temporary Permits (Other State)...')

  const permits = loadJSONData('Temporary_Permit_(Oth_State)_2025-11-20.json')
  console.log(`Found ${permits.length} temporary permits (other state) to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const permit of permits) {
    try {
      // Check if permit already exists
      const existing = await TemporaryPermitOtherState.findOne({ _id: permit._id })
      if (existing) {
        console.log(`  ⚠️  Temporary Permit (Other State) ${permit.permitNumber} already exists, skipping...`)
        continue
      }

      const permitData = {
        ...permit,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(permit._id)
      }

      // Remove bill reference (old model)
      delete permitData.bill

      await TemporaryPermitOtherState.create(permitData)
      console.log(`  ✅ Migrated temporary permit (other state) ${permit.permitNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating temporary permit (other state) ${permit.permitNumber}:`, error.message)
      errors.push({ permitNumber: permit.permitNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Temporary Permits (Other State): ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate National Permit Part A
 */
async function migrateNationalPermitPartA() {
  console.log('\n🌐 Migrating National Permit Part A...')

  const permits = loadJSONData('National_Permit_Part_A_2025-11-20.json')
  console.log(`Found ${permits.length} national permit part A to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const permit of permits) {
    try {
      // Check if permit already exists
      const existing = await NationalPermitPartA.findOne({ _id: permit._id })
      if (existing) {
        console.log(`  ⚠️  National Permit Part A ${permit.permitNumber} already exists, skipping...`)
        continue
      }

      const permitData = {
        ...permit,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(permit._id)
      }

      // Remove bill reference (old model)
      delete permitData.bill

      await NationalPermitPartA.create(permitData)
      console.log(`  ✅ Migrated national permit part A ${permit.permitNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating national permit part A ${permit.permitNumber}:`, error.message)
      errors.push({ permitNumber: permit.permitNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ National Permit Part A: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate National Permit Part B
 */
async function migrateNationalPermitPartB() {
  console.log('\n🌍 Migrating National Permit Part B...')

  const permits = loadJSONData('National_Permit_Part_B_2025-11-20.json')
  console.log(`Found ${permits.length} national permit part B to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const permit of permits) {
    try {
      // Check if permit already exists
      const existing = await NationalPermitPartB.findOne({ _id: permit._id })
      if (existing) {
        console.log(`  ⚠️  National Permit Part B ${permit.partBNumber} already exists, skipping...`)
        continue
      }

      const permitData = {
        ...permit,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(permit._id)
      }

      // Remove bill reference (old model)
      delete permitData.bill

      await NationalPermitPartB.create(permitData)
      console.log(`  ✅ Migrated national permit part B ${permit.partBNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating national permit part B ${permit.partBNumber}:`, error.message)
      errors.push({ partBNumber: permit.partBNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ National Permit Part B: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Migrate Vehicle Transfers
 */
async function migrateVehicleTransfers() {
  console.log('\n🔄 Migrating Vehicle Transfers...')

  const transfers = loadJSONData('Vehicle_Transfer_2025-11-20.json')
  console.log(`Found ${transfers.length} vehicle transfers to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const transfer of transfers) {
    try {
      // Check if transfer already exists
      const existing = await VehicleTransfer.findOne({ _id: transfer._id })
      if (existing) {
        console.log(`  ⚠️  Vehicle Transfer ${transfer.vehicleNumber} already exists, skipping...`)
        continue
      }

      const transferData = {
        ...transfer,
        userId: TARGET_USER_ID,
        _id: new mongoose.Types.ObjectId(transfer._id)
      }

      // Remove bill reference (old model)
      delete transferData.bill

      await VehicleTransfer.create(transferData)
      console.log(`  ✅ Migrated vehicle transfer ${transfer.vehicleNumber}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error migrating vehicle transfer ${transfer.vehicleNumber}:`, error.message)
      errors.push({ vehicleNumber: transfer.vehicleNumber, error: error.message })
      errorCount++
    }
  }

  console.log(`\n✅ Vehicle Transfers: ${successCount} migrated, ${errorCount} errors`)
  return { successCount, errorCount, errors }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('='.repeat(60))
  console.log('🚀 Starting Data Migration with User ID')
  console.log('='.repeat(60))
  console.log(`Target User ID: ${TARGET_USER_ID}`)

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get user information for PDF generation
    console.log('\n👤 Fetching user information...')
    const user = await User.findById(TARGET_USER_ID)
    if (!user) {
      throw new Error(`User with ID ${TARGET_USER_ID} not found`)
    }
    console.log(`✅ Found user: ${user.name}`)

    const userInfo = {
      name: user.name,
      billName: user.billName,
      billDescription: user.billDescription,
      mobile1: user.mobile1,
      mobile2: user.mobile2,
      address: user.address,
      email: user.email
    }

    // Track overall results
    const results = {}

    // Migrate Vehicle Registrations first (as other records reference it)
    results.vehicleRegistrations = await migrateVehicleRegistrations()

    // Migrate Driving Licenses
    results.drivingLicenses = await migrateDrivingLicenses()

    // Migrate Fitness Records
    results.fitnessRecords = await migrateFitnessRecords()

    // Migrate Tax Records
    results.taxRecords = await migrateTaxRecords()

    // Migrate CG Permits
    results.cgPermits = await migrateCGPermits()

    // Migrate Temporary Permits
    results.temporaryPermits = await migrateTemporaryPermits()

    // Migrate Temporary Permits Other State
    results.temporaryPermitsOtherState = await migrateTemporaryPermitsOtherState()

    // Migrate National Permit Part A
    results.nationalPermitPartA = await migrateNationalPermitPartA()

    // Migrate National Permit Part B
    results.nationalPermitPartB = await migrateNationalPermitPartB()

    // Migrate Vehicle Transfers
    results.vehicleTransfers = await migrateVehicleTransfers()

    // Migrate Custom Bills and generate PDFs
    results.customBills = await migrateCustomBills(userInfo)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))

    let totalSuccess = 0
    let totalErrors = 0

    Object.entries(results).forEach(([key, result]) => {
      totalSuccess += result.successCount
      totalErrors += result.errorCount
      console.log(`${key}: ${result.successCount} migrated, ${result.errorCount} errors`)

      if (result.errors && result.errors.length > 0) {
        console.log(`  Errors:`)
        result.errors.forEach(err => {
          console.log(`    - ${JSON.stringify(err)}`)
        })
      }
    })

    console.log('\n' + '-'.repeat(60))
    console.log(`Total: ${totalSuccess} records migrated, ${totalErrors} errors`)
    console.log('='.repeat(60))

    if (totalErrors === 0) {
      console.log('\n✅ Migration completed successfully!')
    } else {
      console.log(`\n⚠️  Migration completed with ${totalErrors} errors`)
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
