const mongoose = require('mongoose')
const CgPermit = require('../models/CgPermit')
require('dotenv').config()

// Migration script to add isRenewed field to all existing CG permit records
async function addIsRenewedFieldToCgPermit() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rto')
    console.log('✅ Connected to MongoDB')

    // Count records without isRenewed field
    const recordsWithoutField = await CgPermit.countDocuments({
      isRenewed: { $exists: false }
    })

    console.log(`📊 Found ${recordsWithoutField} CG permit records without isRenewed field`)

    if (recordsWithoutField === 0) {
      console.log('✅ All CG permit records already have isRenewed field!')
      process.exit(0)
    }

    // Update all records that don't have isRenewed field
    const result = await CgPermit.updateMany(
      { isRenewed: { $exists: false } },  // Find records WITHOUT the field
      { $set: { isRenewed: false } }       // Set isRenewed: false
    )

    console.log(`✅ Migration completed!`)
    console.log(`   Updated ${result.modifiedCount} records`)
    console.log(`   Matched ${result.matchedCount} records`)

    // Verify the migration
    const totalRecords = await CgPermit.countDocuments()
    const recordsWithField = await CgPermit.countDocuments({
      isRenewed: { $exists: true }
    })

    console.log(`\n📊 Verification:`)
    console.log(`   Total CG permit records: ${totalRecords}`)
    console.log(`   Records with isRenewed: ${recordsWithField}`)
    console.log(`   Records without isRenewed: ${totalRecords - recordsWithField}`)

    if (totalRecords === recordsWithField) {
      console.log('\n🎉 All CG permit records now have isRenewed field!')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
addIsRenewedFieldToCgPermit()
