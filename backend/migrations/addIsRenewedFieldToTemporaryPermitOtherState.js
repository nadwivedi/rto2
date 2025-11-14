const mongoose = require('mongoose')
const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
require('dotenv').config()

// Migration script to add isRenewed field to all existing temporary permit (other state) records
async function addIsRenewedFieldToTemporaryPermitOtherState() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rto')
    console.log('✅ Connected to MongoDB')

    // Count records without isRenewed field
    const recordsWithoutField = await TemporaryPermitOtherState.countDocuments({
      isRenewed: { $exists: false }
    })

    console.log(`📊 Found ${recordsWithoutField} temporary permit (other state) records without isRenewed field`)

    if (recordsWithoutField === 0) {
      console.log('✅ All temporary permit (other state) records already have isRenewed field!')
      process.exit(0)
    }

    // Update all records that don't have isRenewed field
    const result = await TemporaryPermitOtherState.updateMany(
      { isRenewed: { $exists: false } },  // Find records WITHOUT the field
      { $set: { isRenewed: false } }       // Set isRenewed: false
    )

    console.log(`✅ Migration completed!`)
    console.log(`   Updated ${result.modifiedCount} records`)
    console.log(`   Matched ${result.matchedCount} records`)

    // Verify the migration
    const totalRecords = await TemporaryPermitOtherState.countDocuments()
    const recordsWithField = await TemporaryPermitOtherState.countDocuments({
      isRenewed: { $exists: true }
    })

    console.log(`\n📊 Verification:`)
    console.log(`   Total temporary permit (other state) records: ${totalRecords}`)
    console.log(`   Records with isRenewed: ${recordsWithField}`)
    console.log(`   Records without isRenewed: ${totalRecords - recordsWithField}`)

    if (totalRecords === recordsWithField) {
      console.log('\n🎉 All temporary permit (other state) records now have isRenewed field!')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
addIsRenewedFieldToTemporaryPermitOtherState()
