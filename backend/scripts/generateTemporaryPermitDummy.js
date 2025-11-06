const mongoose = require('mongoose')
const TemporaryPermit = require('../models/TemporaryPermit')
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
const generateRandomDate = (startYear = 2024, endYear = 2025) => {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Add months to a date
const addMonths = (dateStr, months) => {
  const [day, month, year] = dateStr.split('/')
  const date = new Date(year, month - 1, day)
  date.setMonth(date.getMonth() + months)
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
  return `TMPPMT${year}${num}`
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

// Generate random address
const generateAddress = () => {
  const streets = ['MG Road', 'Main Street', 'Gandhi Nagar', 'Nehru Street', 'Park Avenue', 'Station Road', 'Circular Road']
  const areas = ['Sector 1', 'Sector 2', 'Civil Lines', 'Model Town', 'Sadar Bazar', 'Railway Colony']
  const street = streets[Math.floor(Math.random() * streets.length)]
  const area = areas[Math.floor(Math.random() * areas.length)]
  const houseNo = Math.floor(Math.random() * 999) + 1
  return `${houseNo}, ${street}, ${area}`
}

// Generate random city
const generateCity = () => {
  const cities = ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur']
  return cities[Math.floor(Math.random() * cities.length)]
}

// Generate random pincode
const generatePincode = () => {
  return String(Math.floor(Math.random() * (499999 - 490000 + 1)) + 490000)
}

// Generate random purpose
const generatePurpose = () => {
  const purposes = [
    'Temporary interstate transport',
    'Trial run for new vehicle',
    'One-time goods transportation',
    'Emergency transport permit',
    'Event-based transport',
    'Temporary commercial use'
  ]
  return purposes[Math.floor(Math.random() * purposes.length)]
}

// Generate random policy number
const generatePolicyNumber = () => {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 999999)).padStart(6, '0')
  return `POL${year}${num}`
}

// Determine status based on validTo date
const getStatus = (validTo) => {
  const [day, month, year] = validTo.split('/')
  const validToDate = new Date(year, month - 1, day)
  const today = new Date()
  const diffTime = validToDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expired'
  if (diffDays <= 7) return 'Expiring Soon'
  return 'Active'
}

// Generate 30 dummy temporary permit records
const generateTemporaryPermitDummy = async () => {
  try {
    const tempPermitRecords = []

    for (let i = 1; i <= 30; i++) {
      const permitHolder = generateName()
      const vehicleType = Math.random() > 0.5 ? 'CV' : 'PV' // 50-50 split
      const validityPeriod = vehicleType === 'CV' ? 3 : 1 // CV = 3 months, PV = 1 month
      const issueDate = generateRandomDate(2024, 2025)
      const validFrom = issueDate
      const validTo = addMonths(validFrom, validityPeriod)
      const totalFee = vehicleType === 'CV' ? Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500 : Math.floor(Math.random() * (1500 - 500 + 1)) + 500
      const paid = Math.random() > 0.15 ? totalFee : Math.floor(totalFee * (Math.random() * 0.7 + 0.3)) // 15% chance of partial payment
      const balance = totalFee - paid

      tempPermitRecords.push({
        permitNumber: generatePermitNumber(i),
        permitHolder,
        vehicleNumber: generateVehicleNumber(),
        vehicleType,
        validFrom,
        validTo,
        validityPeriod,
        fatherName: Math.random() > 0.3 ? generateName() : undefined,
        address: Math.random() > 0.4 ? generateAddress() : undefined,
        city: Math.random() > 0.4 ? generateCity() : undefined,
        state: 'Chhattisgarh',
        pincode: Math.random() > 0.4 ? generatePincode() : undefined,
        mobileNumber: generateMobileNumber(),
        email: Math.random() > 0.5 ? generateEmail(permitHolder) : undefined,
        purpose: generatePurpose(),
        restrictions: 'As per RTO regulations',
        conditions: 'Valid for temporary use only. Must carry valid documents.',
        issuingAuthority: 'Regional Transport Office',
        issueDate,
        totalFee,
        paid,
        balance,
        status: getStatus(validTo),
        insuranceDetails: Math.random() > 0.3 ? {
          policyNumber: generatePolicyNumber(),
          company: ['ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'TATA AIG', 'New India'][Math.floor(Math.random() * 5)],
          validUpto: addMonths(issueDate, 12)
        } : {
          policyNumber: 'N/A',
          company: 'N/A',
          validUpto: 'N/A'
        },
        notes: Math.random() > 0.7 ? 'Temporary permit for short duration' : ''
      })
    }

    // Delete existing records (optional - remove this if you want to keep existing data)
    await TemporaryPermit.deleteMany({})
    console.log('🗑️  Cleared existing temporary permit records')

    // Insert new records
    const result = await TemporaryPermit.insertMany(tempPermitRecords)
    console.log(`✅ Successfully inserted ${result.length} temporary permit records`)

    // Display summary
    const statusCount = {
      Active: result.filter(r => r.status === 'Active').length,
      'Expiring Soon': result.filter(r => r.status === 'Expiring Soon').length,
      Expired: result.filter(r => r.status === 'Expired').length
    }

    const vehicleTypeCount = {
      CV: result.filter(r => r.vehicleType === 'CV').length,
      PV: result.filter(r => r.vehicleType === 'PV').length
    }

    const paymentSummary = {
      fullyPaid: result.filter(r => r.balance === 0).length,
      partialPaid: result.filter(r => r.balance > 0 && r.paid > 0).length,
      unpaid: result.filter(r => r.paid === 0).length
    }

    console.log('\n📊 Summary:')
    console.log('   Status:')
    console.log(`     Active: ${statusCount.Active}`)
    console.log(`     Expiring Soon: ${statusCount['Expiring Soon']}`)
    console.log(`     Expired: ${statusCount.Expired}`)
    console.log('   Vehicle Type:')
    console.log(`     Commercial (CV): ${vehicleTypeCount.CV}`)
    console.log(`     Passenger (PV): ${vehicleTypeCount.PV}`)
    console.log('   Payment:')
    console.log(`     Fully Paid: ${paymentSummary.fullyPaid}`)
    console.log(`     Partial Paid: ${paymentSummary.partialPaid}`)
    console.log(`     Unpaid: ${paymentSummary.unpaid}`)
    console.log(`   Total: ${result.length}`)

  } catch (error) {
    console.error('❌ Error generating temporary permit dummy data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

// Run the script
const run = async () => {
  await connectDB()
  await generateTemporaryPermitDummy()
}

run()
