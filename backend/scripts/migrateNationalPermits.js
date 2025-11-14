const mongoose = require('mongoose')
const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')
const CustomBill = require('../models/CustomBill')
const fs = require('fs')
const path = require('path')

// MongoDB connection string - update with your database URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto'

// Read the NP.json file
const npDataPath = path.join(__dirname, '../utils/Np.json')
const npData = JSON.parse(fs.readFileSync(npDataPath, 'utf-8'))

async function migrateNationalPermits() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully')

    console.log(`\n📊 Found ${npData.length} National Permit records to migrate\n`)

    let successCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 0; i < npData.length; i++) {
      const oldPermit = npData[i]

      try {
        console.log(`\n[${i + 1}/${npData.length}] Processing: ${oldPermit.permitNumber} - ${oldPermit.vehicleNumber}`)

        // Check if already migrated
        const existingPartA = await NationalPermitPartA.findOne({
          vehicleNumber: oldPermit.vehicleNumber,
          permitNumber: oldPermit.permitNumber
        })

        if (existingPartA) {
          console.log(`   ⚠️  Already exists, skipping...`)
          continue
        }

        // Handle bill - only if it exists in the JSON data
        let billId = null

        if (oldPermit.bill && oldPermit.bill._id) {
          // Check if bill already exists in database
          const existingBill = await CustomBill.findById(oldPermit.bill._id)

          if (existingBill) {
            billId = existingBill._id
            console.log(`   💵 Using existing bill: ${existingBill.billNumber}`)
          } else {
            // Create the bill from JSON data
            const newBill = new CustomBill({
              _id: oldPermit.bill._id,
              billNumber: oldPermit.bill.billNumber,
              billDate: oldPermit.bill.billDate,
              customerName: oldPermit.bill.customerName,
              items: oldPermit.bill.items,
              totalAmount: oldPermit.bill.totalAmount,
              billPdfPath: oldPermit.bill.billPdfPath || null,
              createdAt: oldPermit.bill.createdAt,
              updatedAt: oldPermit.bill.updatedAt
            })
            await newBill.save()
            billId = newBill._id
            console.log(`   💵 Created bill: ${newBill.billNumber}`)
          }
        } else {
          console.log(`   ⚠️  No bill in original data - Part A will be created without bill reference`)
        }

        // Create Part A
        const partAData = {
          vehicleNumber: oldPermit.vehicleNumber,
          permitNumber: oldPermit.permitNumber,
          permitHolder: oldPermit.permitHolder,
          fatherName: oldPermit.fatherName || '',
          address: oldPermit.address || '',
          mobileNumber: oldPermit.mobileNumber || '',
          email: oldPermit.email || '',
          validFrom: oldPermit.validFrom,
          validTo: oldPermit.validTo,
          totalFee: oldPermit.totalFee,
          paid: oldPermit.paid,
          balance: oldPermit.balance,
          status: oldPermit.status === 'Active' ? 'active' : oldPermit.status.toLowerCase().replace(' ', '_'),
          documents: {
            partAImage: oldPermit.documents?.partAImage || ''
          },
          notes: oldPermit.notes || 'Migrated from old schema',
          createdAt: oldPermit.createdAt,
          updatedAt: oldPermit.updatedAt
        }

        // Only add bill if it exists
        if (billId) {
          partAData.bill = billId
        }

        const newPartA = new NationalPermitPartA(partAData)
        await newPartA.save()
        console.log(`   ✅ Created Part A: ${newPartA.permitNumber}`)

        // Create Part B (WITHOUT bill reference - created with Part A)
        const newPartB = new NationalPermitPartB({
          vehicleNumber: oldPermit.vehicleNumber,
          permitNumber: oldPermit.permitNumber,
          partBNumber: oldPermit.typeBAuthorization.authorizationNumber,
          permitHolder: oldPermit.permitHolder,
          validFrom: oldPermit.typeBAuthorization.validFrom,
          validTo: oldPermit.typeBAuthorization.validTo,
          status: oldPermit.status === 'Active' ? 'active' : oldPermit.status.toLowerCase().replace(' ', '_'),
          documents: {
            partBImage: oldPermit.documents?.partBImage || ''
          },
          notes: 'Migrated from old schema - Created with Part A',
          createdAt: oldPermit.createdAt,
          updatedAt: oldPermit.updatedAt
          // No totalFee, paid, balance, bill - created with Part A
        })
        await newPartB.save()
        console.log(`   ✅ Created Part B: ${newPartB.partBNumber}`)

        // If there are Part A renewal history, migrate them
        if (oldPermit.partARenewalHistory && oldPermit.partARenewalHistory.length > 0) {
          console.log(`   📝 Found ${oldPermit.partARenewalHistory.length} Part A renewal(s)`)

          for (const renewal of oldPermit.partARenewalHistory) {
            // Create bill for renewal if it exists
            let renewalBillId = null

            if (renewal.bill) {
              const existingRenewalBill = await CustomBill.findById(renewal.bill)
              if (existingRenewalBill) {
                renewalBillId = existingRenewalBill._id
              } else {
                console.log(`   ⚠️  Renewal bill ${renewal.bill} not found, skipping`)
              }
            }

            if (renewalBillId) {
              const partARenewal = new NationalPermitPartA({
                vehicleNumber: oldPermit.vehicleNumber,
                permitNumber: renewal.permitNumber || oldPermit.permitNumber,
                permitHolder: oldPermit.permitHolder,
                fatherName: oldPermit.fatherName || '',
                address: oldPermit.address || '',
                mobileNumber: oldPermit.mobileNumber || '',
                email: oldPermit.email || '',
                validFrom: renewal.validFrom,
                validTo: renewal.validTo,
                totalFee: renewal.totalFee || 15000,
                paid: renewal.paid || 0,
                balance: renewal.balance || 0,
                bill: renewalBillId,
                status: renewal.paymentStatus === 'Paid' ? 'expired' : 'active',
                notes: renewal.notes || 'Part A renewal - Migrated from old schema',
                createdAt: renewal.renewalDate || oldPermit.createdAt,
                updatedAt: renewal.renewalDate || oldPermit.updatedAt
              })
              await partARenewal.save()
              console.log(`      ✅ Created Part A renewal record`)
            }
          }
        }

        // If there are Part B renewal history, migrate them
        if (oldPermit.typeBAuthorization?.renewalHistory && oldPermit.typeBAuthorization.renewalHistory.length > 0) {
          console.log(`   📝 Found ${oldPermit.typeBAuthorization.renewalHistory.length} Part B renewal(s)`)

          for (const renewal of oldPermit.typeBAuthorization.renewalHistory) {
            // Create bill for renewal if it exists
            let renewalBillId = null

            if (renewal.bill) {
              const existingRenewalBill = await CustomBill.findById(renewal.bill)
              if (existingRenewalBill) {
                renewalBillId = existingRenewalBill._id
              } else {
                console.log(`   ⚠️  Renewal bill ${renewal.bill} not found, skipping`)
              }
            }

            if (renewalBillId) {
              const partBRenewal = new NationalPermitPartB({
                vehicleNumber: oldPermit.vehicleNumber,
                permitNumber: oldPermit.permitNumber,
                partBNumber: renewal.authorizationNumber,
                permitHolder: oldPermit.permitHolder,
                validFrom: renewal.validFrom,
                validTo: renewal.validTo,
                totalFee: renewal.totalFee || 5000,
                paid: renewal.paid || 0,
                balance: renewal.balance || 0,
                bill: renewalBillId,
                status: renewal.paymentStatus === 'Paid' ? 'expired' : 'active',
                notes: renewal.notes || 'Part B renewal - Migrated from old schema',
                createdAt: renewal.renewalDate || oldPermit.createdAt,
                updatedAt: renewal.renewalDate || oldPermit.updatedAt
              })
              await partBRenewal.save()
              console.log(`      ✅ Created Part B renewal record`)
            }
          }
        }

        successCount++
        console.log(`   ✨ Migration successful for ${oldPermit.permitNumber}`)

      } catch (error) {
        errorCount++
        const errorMsg = `Error migrating ${oldPermit.permitNumber}: ${error.message}`
        console.error(`   ❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(70))
    console.log(`✅ Successfully migrated: ${successCount}/${npData.length}`)
    console.log(`❌ Failed: ${errorCount}/${npData.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors:')
      errors.forEach(err => console.log(`   - ${err}`))
    }

    console.log('\n✅ Migration completed!')

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the migration
migrateNationalPermits()
  .then(() => {
    console.log('\n🎉 Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })
