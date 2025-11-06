const mongoose = require('mongoose')
const Tax = require('../models/Tax')
require('dotenv').config()

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rto', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Generate random date in DD/MM/YYYY format
const generateRandomDate = (startYear = 2023, endYear = 2026) => {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Add one year to a date
const addOneYear = (dateStr) => {
  const [day, month, year] = dateStr.split('/')
  const date = new Date(year, month - 1, day)
  date.setFullYear(date.getFullYear() + 1)
  date.setDate(date.getDate() - 1) // Minus 1 day
  const newDay = String(date.getDate()).padStart(2, '0')
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  const newYear = date.getFullYear()
  return `${newDay}/${newMonth}/${newYear}`
}

// Generate random vehicle number
const generateVehicleNumber = () => {
  const states = ['CG', 'MH', 'DL', 'KA', 'TN', 'UP', 'MP', 'RJ', 'GJ', 'WB']
  const state = states[Math.floor(Math.random() * states.length)]
  const district = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  return `${state}${district}${series}${number}`
}

// Generate random receipt number
const generateReceiptNo = (index) => {
  const year = new Date().getFullYear()
  const num = String(index).padStart(5, '0')
  return `TAX${year}${num}`
}

// Generate random owner names
const generateOwnerName = () => {
  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Ramesh', 'Deepa', 'Anil', 'Pooja', 'Manoj', 'Sneha', 'Rakesh']
  const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Rao', 'Verma', 'Yadav', 'Joshi', 'Desai', 'Mehta', 'Chopra', 'Nair', 'Iyer']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

// Determine status based on taxTo date
const getStatus = (taxTo) => {
  const [day, month, year] = taxTo.split('/')
  const taxToDate = new Date(year, month - 1, day)
  const today = new Date()
  const diffTime = taxToDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring_soon'
  return 'active'
}

// Generate 30 dummy tax records
const generateTaxDummy = async () => {
  try {
    const taxRecords = []

    for (let i = 1; i <= 30; i++) {
      const taxFrom = generateRandomDate(2023, 2025)
      const taxTo = addOneYear(taxFrom)
      const totalAmount = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000 // 2000-8000
      const paidAmount = Math.random() > 0.25 ? totalAmount : Math.floor(totalAmount * (Math.random() * 0.7 + 0.3)) // 25% chance of partial payment
      const balanceAmount = totalAmount - paidAmount

      taxRecords.push({
        receiptNo: generateReceiptNo(i),
        vehicleNumber: generateVehicleNumber(),
        ownerName: generateOwnerName(),
        totalAmount,
        paidAmount,
        balanceAmount,
        taxFrom,
        taxTo,
        status: getStatus(taxTo)
      })
    }

    // Delete existing records (optional - remove this if you want to keep existing data)
    await Tax.deleteMany({})
    console.log('🗑️  Cleared existing tax records')

    // Insert new records
    const result = await Tax.insertMany(taxRecords)
    console.log(`✅ Successfully inserted ${result.length} tax records`)

    // Display summary
    const statusCount = {
      active: result.filter(r => r.status === 'active').length,
      expiring_soon: result.filter(r => r.status === 'expiring_soon').length,
      expired: result.filter(r => r.status === 'expired').length
    }

    const paymentSummary = {
      fullyPaid: result.filter(r => r.balanceAmount === 0).length,
      partialPaid: result.filter(r => r.balanceAmount > 0 && r.paidAmount > 0).length,
      unpaid: result.filter(r => r.paidAmount === 0).length
    }

    console.log('\n📊 Summary:')
    console.log('   Status:')
    console.log(`     Active: ${statusCount.active}`)
    console.log(`     Expiring Soon: ${statusCount.expiring_soon}`)
    console.log(`     Expired: ${statusCount.expired}`)
    console.log('   Payment:')
    console.log(`     Fully Paid: ${paymentSummary.fullyPaid}`)
    console.log(`     Partial Paid: ${paymentSummary.partialPaid}`)
    console.log(`     Unpaid: ${paymentSummary.unpaid}`)
    console.log(`   Total: ${result.length}`)

  } catch (error) {
    console.error('❌ Error generating tax dummy data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

// Run the script
const run = async () => {
  await connectDB()
  await generateTaxDummy()
}

run()
