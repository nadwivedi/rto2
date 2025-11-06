const mongoose = require('mongoose')
const Fitness = require('../models/Fitness')
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

// Determine status based on validTo date
const getStatus = (validTo) => {
  const [day, month, year] = validTo.split('/')
  const validToDate = new Date(year, month - 1, day)
  const today = new Date()
  const diffTime = validToDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring_soon'
  return 'active'
}

// Generate 30 dummy fitness records
const generateFitnessDummy = async () => {
  try {
    const fitnessRecords = []

    for (let i = 1; i <= 30; i++) {
      const validFrom = generateRandomDate(2023, 2025)
      const validTo = addOneYear(validFrom)
      const totalFee = Math.floor(Math.random() * (3000 - 800 + 1)) + 800 // 800-3000
      const paid = Math.random() > 0.3 ? totalFee : Math.floor(totalFee * (Math.random() * 0.7 + 0.3)) // 30% chance of partial payment
      const balance = totalFee - paid

      fitnessRecords.push({
        vehicleNumber: generateVehicleNumber(),
        validFrom,
        validTo,
        totalFee,
        paid,
        balance,
        status: getStatus(validTo)
      })
    }

    // Delete existing records (optional - remove this if you want to keep existing data)
    await Fitness.deleteMany({})
    console.log('🗑️  Cleared existing fitness records')

    // Insert new records
    const result = await Fitness.insertMany(fitnessRecords)
    console.log(`✅ Successfully inserted ${result.length} fitness records`)

    // Display summary
    const statusCount = {
      active: result.filter(r => r.status === 'active').length,
      expiring_soon: result.filter(r => r.status === 'expiring_soon').length,
      expired: result.filter(r => r.status === 'expired').length
    }

    console.log('\n📊 Summary:')
    console.log(`   Active: ${statusCount.active}`)
    console.log(`   Expiring Soon: ${statusCount.expiring_soon}`)
    console.log(`   Expired: ${statusCount.expired}`)
    console.log(`   Total: ${result.length}`)

  } catch (error) {
    console.error('❌ Error generating fitness dummy data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

// Run the script
const run = async () => {
  await connectDB()
  await generateFitnessDummy()
}

run()
