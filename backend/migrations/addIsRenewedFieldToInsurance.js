const mongoose = require('mongoose')
const Insurance = require('../models/Insurance')
require('dotenv').config()

// Migration script to add isRenewed field to all existing insurance records
async function addIsRenewedFieldToInsurance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rto')
    console.log('✅ Connected to MongoDB')

    // Count records without isRenewed field
    const recordsWithoutField = await Insurance.countDocuments({
      isRenewed: { $exists: false }
    })

    console.log(`📊 Found ${recordsWithoutField} insurance records without isRenewed field`)

    if (recordsWithoutField === 0) {
      console.log('✅ All insurance records already have isRenewed field!')
      process.exit(0)
    }

    // Update all records that don't have isRenewed field
    const result = await Insurance.updateMany(
      { isRenewed: { $exists: false } },  // Find records WITHOUT the field
      { $set: { isRenewed: false } }       // Set isRenewed: false
    )

    console.log(`✅ Migration completed!`)
    console.log(`   Updated ${result.modifiedCount} records`)
    console.log(`   Matched ${result.matchedCount} records`)

    // Verify the migration
    const totalRecords = await Insurance.countDocuments()
    const recordsWithField = await Insurance.countDocuments({
      isRenewed: { $exists: true }
    })

    console.log(`\n📊 Verification:`)
    console.log(`   Total insurance records: ${totalRecords}`)
    console.log(`   Records with isRenewed: ${recordsWithField}`)
    console.log(`   Records without isRenewed: ${totalRecords - recordsWithField}`)

    if (totalRecords === recordsWithField) {
      console.log('\n🎉 All insurance records now have isRenewed field!')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
addIsRenewedFieldToInsurance()
