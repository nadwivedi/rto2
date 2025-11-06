const mongoose = require('mongoose')
const VehicleRegistration = require('../models/VehicleRegistration')
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
const generateRandomDate = (startYear = 2020, endYear = 2024) => {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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

// Generate random chassis number
const generateChassisNumber = () => {
  const prefix = ['MA', 'MB', 'MC', 'MD', 'ME', 'MH', 'NM', 'SB', 'VD']
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)]
  const numbers = String(Math.floor(Math.random() * 1000000000000000)).padStart(15, '0')
  return `${randomPrefix}${numbers}`.substring(0, 17)
}

// Generate random engine number
const generateEngineNumber = () => {
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                  String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const numbers = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return `${letters}${numbers}`
}

// Generate random owner name
const generateOwnerName = () => {
  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Kavita',
                      'Rahul', 'Pooja', 'Anil', 'Deepa', 'Manoj', 'Sunita', 'Ravi', 'Meera',
                      'Karan', 'Divya', 'Sanjay', 'Nisha', 'Ajay', 'Rekha', 'Vijay', 'Asha',
                      'Rakesh', 'Geeta', 'Naveen', 'Swati', 'Ramesh', 'Neha']
  const lastNames = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Shah',
                     'Jain', 'Mehta', 'Nair', 'Rao', 'Desai', 'Kulkarni', 'Iyer', 'Chopra',
                     'Malhotra', 'Agarwal', 'Bansal', 'Kapoor', 'Pandey', 'Mishra', 'Saxena', 'Joshi']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

// Generate relation name
const generateRelation = (ownerName) => {
  const relations = ['S/O', 'W/O', 'D/O']
  const relation = relations[Math.floor(Math.random() * relations.length)]
  const names = ['Ram', 'Shyam', 'Mohan', 'Sohan', 'Krishna', 'Hari', 'Gopal', 'Kishan']
  const lastName = ownerName.split(' ')[1] || 'Kumar'
  const relatedName = names[Math.floor(Math.random() * names.length)]
  return `${relation} ${relatedName} ${lastName}`
}

// Generate random address
const generateAddress = () => {
  const streets = ['MG Road', 'Main Road', 'Station Road', 'Gandhi Nagar', 'Nehru Colony',
                   'Civil Lines', 'Model Town', 'Sadar Bazar', 'Rajendra Nagar', 'Azad Chowk']
  const cities = ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Raigarh']
  const street = streets[Math.floor(Math.random() * streets.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const houseNo = Math.floor(Math.random() * 999) + 1
  return `${houseNo}, ${street}, ${city}, Chhattisgarh`
}

// Generate random mobile number
const generateMobileNumber = () => {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return `${prefix}${number}`
}

// Generate email from owner name
const generateEmail = (ownerName) => {
  const name = ownerName.toLowerCase().replace(/\s+/g, '.')
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${name}@${domain}`
}

// Vehicle data arrays
const makers = [
  { name: 'Maruti Suzuki', models: ['Swift', 'Alto', 'Wagon R', 'Baleno', 'Dzire', 'Ertiga', 'Vitara Brezza'] },
  { name: 'Hyundai', models: ['i20', 'Creta', 'Verna', 'Grand i10', 'Venue', 'Santro'] },
  { name: 'Tata', models: ['Nexon', 'Harrier', 'Safari', 'Tiago', 'Tigor', 'Altroz', 'Punch'] },
  { name: 'Mahindra', models: ['Scorpio', 'XUV700', 'Thar', 'Bolero', 'XUV300', 'Scorpio-N'] },
  { name: 'Honda', models: ['City', 'Amaze', 'Jazz', 'WR-V', 'Civic'] },
  { name: 'Toyota', models: ['Fortuner', 'Innova Crysta', 'Glanza', 'Urban Cruiser'] },
  { name: 'Kia', models: ['Seltos', 'Sonet', 'Carens', 'Carnival'] },
  { name: 'Renault', models: ['Kwid', 'Duster', 'Kiger', 'Triber'] }
]

const colours = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown', 'Beige', 'Orange']
const vehicleClasses = ['LMV', 'HMV', 'LCV', 'HCV', 'MCWG', 'MCWOG', '2W', '3W']
const vehicleTypes = ['Sedan', 'Hatchback', 'SUV', 'MPV', 'Motorcycle', 'Auto-Rickshaw', 'Truck', 'Bus']
const vehicleCategories = ['Transport', 'Non-Transport', 'Personal', 'Commercial']

// Generate vehicle details
const generateVehicleDetails = () => {
  const maker = makers[Math.floor(Math.random() * makers.length)]
  const model = maker.models[Math.floor(Math.random() * maker.models.length)]
  return { makerName: maker.name, makerModel: model }
}

// Generate 50 dummy vehicle registration records
const generateVehicleRegistrationDummy = async () => {
  try {
    const registrationRecords = []

    for (let i = 1; i <= 50; i++) {
      const ownerName = generateOwnerName()
      const vehicleDetails = generateVehicleDetails()
      const manufactureYear = Math.floor(Math.random() * (2024 - 2015 + 1)) + 2015
      const dateOfRegistration = generateRandomDate(manufactureYear, manufactureYear + 1)
      const purchaseDeliveryDate = generateRandomDate(manufactureYear, manufactureYear + 1)
      const seatingCapacity = Math.floor(Math.random() * 3) === 0 ? 2 :
                             Math.floor(Math.random() * 3) === 1 ? 5 : 7

      registrationRecords.push({
        registrationNumber: generateVehicleNumber(),
        dateOfRegistration,
        chassisNumber: generateChassisNumber(),
        engineNumber: generateEngineNumber(),
        ownerName,
        sonWifeDaughterOf: generateRelation(ownerName),
        address: generateAddress(),
        mobileNumber: generateMobileNumber(),
        email: generateEmail(ownerName),
        makerName: vehicleDetails.makerName,
        makerModel: vehicleDetails.makerModel,
        colour: colours[Math.floor(Math.random() * colours.length)],
        seatingCapacity,
        vehicleClass: vehicleClasses[Math.floor(Math.random() * vehicleClasses.length)],
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        ladenWeight: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
        unladenWeight: Math.floor(Math.random() * (3000 - 800 + 1)) + 800,
        manufactureYear,
        vehicleCategory: vehicleCategories[Math.floor(Math.random() * vehicleCategories.length)],
        purchaseDeliveryDate,
        saleAmount: Math.floor(Math.random() * (2000000 - 300000 + 1)) + 300000
      })
    }

    // Delete existing records (optional - remove this if you want to keep existing data)
    await VehicleRegistration.deleteMany({})
    console.log('🗑️  Cleared existing vehicle registration records')

    // Insert new records
    const result = await VehicleRegistration.insertMany(registrationRecords)
    console.log(`✅ Successfully inserted ${result.length} vehicle registration records`)

    // Display summary
    const categorySummary = {}
    vehicleCategories.forEach(cat => {
      categorySummary[cat] = result.filter(r => r.vehicleCategory === cat).length
    })

    const classSummary = {}
    vehicleClasses.forEach(cls => {
      classSummary[cls] = result.filter(r => r.vehicleClass === cls).length
    })

    console.log('\n📊 Summary:')
    console.log('   Vehicle Category:')
    Object.entries(categorySummary).forEach(([cat, count]) => {
      console.log(`     ${cat}: ${count}`)
    })
    console.log('   Vehicle Class:')
    Object.entries(classSummary).forEach(([cls, count]) => {
      console.log(`     ${cls}: ${count}`)
    })
    console.log(`   Total: ${result.length}`)

    // Show sample record
    console.log('\n📝 Sample Record:')
    console.log(`   Registration No: ${result[0].registrationNumber}`)
    console.log(`   Owner: ${result[0].ownerName}`)
    console.log(`   Vehicle: ${result[0].makerName} ${result[0].makerModel}`)
    console.log(`   Year: ${result[0].manufactureYear}`)

  } catch (error) {
    console.error('❌ Error generating vehicle registration dummy data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

// Run the script
const run = async () => {
  await connectDB()
  await generateVehicleRegistrationDummy()
}

run()
