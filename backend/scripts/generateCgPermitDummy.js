const mongoose = require('mongoose')
const CgPermit = require('../models/CgPermit')
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

// Generate random permit number
const generatePermitNumber = (index) => {
  const year = new Date().getFullYear()
  const num = String(index).padStart(6, '0')
  return `CGPMT${year}${num}`
}

// Generate random mobile number
const generateMobileNumber = () => {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return `${prefix}${number}`
}

// Generate random Indian name
const generateName = () => {
  const firstNames = ['Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Amit', 'Vijay', 'Anil', 'Prakash', 'Santosh', 'Dinesh', 'Ravi', 'Mohan', 'Ashok', 'Rajeev', 'Sanjay']
  const lastNames = ['Kumar', 'Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Yadav', 'Reddy', 'Nair', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Patil', 'Thakur']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

// Generate random email
const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const username = name.toLowerCase().replace(/\s+/g, '.')
  return `${username}@${domain}`
}

// Determine status based on validTo date
const getStatus = (validTo) => {
  const [day, month, year] = validTo.split('/')
  const validToDate = new Date(year, month - 1, day)
  const today = new Date()
  const diffTime = validToDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expired'
  if (diffDays <= 30) return 'Expiring Soon'
  if (diffDays <= 60) return 'Pending Renewal'
  return 'Active'
}

// Generate 30 dummy CG permit records
const generateCgPermitDummy = async () => {
  try {
    const cgPermitRecords = []

    for (let i = 1; i <= 30; i++) {
      const permitHolder = generateName()
      const issueDate = generateRandomDate(2023, 2025)
      const validFrom = issueDate
      const validTo = addOneYear(validFrom)
      const totalFee = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000 // 8000-15000
      const paid = Math.random() > 0.2 ? totalFee : Math.floor(totalFee * (Math.random() * 0.7 + 0.3)) // 20% chance of partial payment
      const balance = totalFee - paid

      cgPermitRecords.push({
        permitNumber: generatePermitNumber(i),
        permitHolder,
        vehicleNumber: generateVehicleNumber(),
        validFrom,
        validTo,
        fatherName: Math.random() > 0.3 ? generateName() : undefined,
        mobileNumber: generateMobileNumber(),
        email: Math.random() > 0.4 ? generateEmail(permitHolder) : undefined,
        totalFee,
        paid,
        balance,
        status: getStatus(validTo),
        notes: Math.random() > 0.7 ? 'CG permit for interstate commerce' : ''
      })
    }

    // Delete existing records (optional - remove this if you want to keep existing data)
    await CgPermit.deleteMany({})
    console.log('🗑️  Cleared existing CG permit records')

    // Insert new records
    const result = await CgPermit.insertMany(cgPermitRecords)
    console.log(`✅ Successfully inserted ${result.length} CG permit records`)

    // Display summary
    const statusCount = {
      Active: result.filter(r => r.status === 'Active').length,
      'Pending Renewal': result.filter(r => r.status === 'Pending Renewal').length,
      'Expiring Soon': result.filter(r => r.status === 'Expiring Soon').length,
      Expired: result.filter(r => r.status === 'Expired').length
    }

    const paymentSummary = {
      fullyPaid: result.filter(r => r.balance === 0).length,
      partialPaid: result.filter(r => r.balance > 0 && r.paid > 0).length,
      unpaid: result.filter(r => r.paid === 0).length
    }

    console.log('\n📊 Summary:')
    console.log('   Status:')
    console.log(`     Active: ${statusCount.Active}`)
    console.log(`     Pending Renewal: ${statusCount['Pending Renewal']}`)
    console.log(`     Expiring Soon: ${statusCount['Expiring Soon']}`)
    console.log(`     Expired: ${statusCount.Expired}`)
    console.log('   Payment:')
    console.log(`     Fully Paid: ${paymentSummary.fullyPaid}`)
    console.log(`     Partial Paid: ${paymentSummary.partialPaid}`)
    console.log(`     Unpaid: ${paymentSummary.unpaid}`)
    console.log(`   Total: ${result.length}`)

  } catch (error) {
    console.error('❌ Error generating CG permit dummy data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

// Run the script
const run = async () => {
  await connectDB()
  await generateCgPermitDummy()
}

run()
