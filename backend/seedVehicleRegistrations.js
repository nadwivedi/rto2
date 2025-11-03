const mongoose = require('mongoose')
const VehicleRegistration = require('./models/VehicleRegistration')

// MongoDB connection string - Update this if your connection string is different
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto'

// Demo vehicle registration data
const demoRegistrations = [
  {
    registrationNumber: 'CG04AB1234',
    vehicleNumber: 'CG04AB1234',
    dateOfRegistration: '15-01-2020',
    chassisNumber: 'MA3ERLF3S00123456',
    engineNumber: 'K10BN1234567',
    ownerName: 'Rajesh Kumar Verma',
    sonWifeDaughterOf: 'Late Ramesh Verma',
    address: 'H.No. 123, Sector 5, Bhilai, Durg, Chhattisgarh - 490006',
    makerName: 'Maruti Suzuki',
    makerModel: 'Swift VXI',
    colour: 'Pearl White',
    seatingCapacity: 5,
    vehicleClass: 'Motor Car',
    vehicleType: 'Four Wheeler',
    ladenWeight: 1500,
    unladenWeight: 900,
    manufactureYear: 2020,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '10-01-2020',
    saleAmount: 650000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG07CD5678',
    vehicleNumber: 'CG07CD5678',
    dateOfRegistration: '22-06-2019',
    chassisNumber: 'MBLHA03P8JC234567',
    engineNumber: 'HA03PEJC234567',
    ownerName: 'Priya Sharma',
    sonWifeDaughterOf: 'Suresh Sharma',
    address: 'Village - Panduka, Post - Siltara, Raipur, Chhattisgarh - 493111',
    makerName: 'Honda',
    makerModel: 'Activa 5G',
    colour: 'Black',
    seatingCapacity: 2,
    vehicleClass: 'Motor Cycle',
    vehicleType: 'Two Wheeler',
    unladenWeight: 109,
    manufactureYear: 2019,
    vehicleCategory: 'MCWOG',
    purchaseDeliveryDate: '18-06-2019',
    saleAmount: 62000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG20MN9876',
    vehicleNumber: 'CG20MN9876',
    dateOfRegistration: '05-03-2021',
    chassisNumber: 'MAT452308H1G12345',
    engineNumber: 'CR5F1H1G12345',
    ownerName: 'Amit Singh Thakur',
    sonWifeDaughterOf: 'Vijay Singh Thakur',
    address: 'Plot No. 45, Gandhi Nagar, Bilaspur, Chhattisgarh - 495001',
    makerName: 'Tata',
    makerModel: 'Nexon XZ Plus',
    colour: 'Flame Red',
    seatingCapacity: 5,
    vehicleClass: 'Motor Car',
    vehicleType: 'Four Wheeler',
    ladenWeight: 1850,
    unladenWeight: 1250,
    manufactureYear: 2021,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '01-03-2021',
    saleAmount: 1150000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG04XY3456',
    vehicleNumber: 'CG04XY3456',
    dateOfRegistration: '18-11-2018',
    chassisNumber: 'ME4JF513XEK098765',
    engineNumber: 'JF513EK098765',
    ownerName: 'Sunita Devi Gupta',
    sonWifeDaughterOf: 'Mohan Lal Gupta',
    address: 'Behind SBI Bank, Station Road, Durg, Chhattisgarh - 491001',
    makerName: 'Mahindra',
    makerModel: 'Bolero Power Plus',
    colour: 'Diamond White',
    seatingCapacity: 7,
    vehicleClass: 'Light Motor Vehicle',
    vehicleType: 'Four Wheeler',
    ladenWeight: 2450,
    unladenWeight: 1685,
    manufactureYear: 2018,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '15-11-2018',
    saleAmount: 850000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG07PQ7890',
    vehicleNumber: 'CG07PQ7890',
    dateOfRegistration: '30-08-2022',
    chassisNumber: 'MD2A25KF2M8765432',
    engineNumber: 'D25KF2M8765432',
    ownerName: 'Ramesh Transport Services',
    sonWifeDaughterOf: 'Ramesh Kumar',
    address: 'Transport Nagar, Near Railway Station, Raipur, Chhattisgarh - 492001',
    makerName: 'Ashok Leyland',
    makerModel: 'Dost Plus',
    colour: 'White',
    seatingCapacity: 3,
    vehicleClass: 'Light Goods Vehicle',
    vehicleType: 'Commercial Vehicle',
    ladenWeight: 2500,
    unladenWeight: 1350,
    manufactureYear: 2022,
    vehicleCategory: 'LGV',
    purchaseDeliveryDate: '25-08-2022',
    saleAmount: 725000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG10RS2345',
    vehicleNumber: 'CG10RS2345',
    dateOfRegistration: '12-05-2017',
    chassisNumber: 'ME4JC444FGH098765',
    engineNumber: 'JC444GH098765',
    ownerName: 'Vikram Auto Repairs',
    sonWifeDaughterOf: 'Vikram Singh',
    address: 'Shop No. 12, Industrial Area, Rajnandgaon, Chhattisgarh - 491441',
    makerName: 'Bajaj',
    makerModel: 'RE Compact',
    colour: 'Yellow',
    seatingCapacity: 4,
    vehicleClass: 'Auto Rickshaw',
    vehicleType: 'Three Wheeler',
    unladenWeight: 410,
    manufactureYear: 2017,
    vehicleCategory: '3W-NT',
    purchaseDeliveryDate: '08-05-2017',
    saleAmount: 185000,
    status: 'Transferred'
  },
  {
    registrationNumber: 'CG22UV6789',
    vehicleNumber: 'CG22UV6789',
    dateOfRegistration: '25-09-2023',
    chassisNumber: 'MA1PA2E2S00654321',
    engineNumber: 'PA2E2S00654321',
    ownerName: 'Deepak Kumar Sahu',
    sonWifeDaughterOf: 'Ghanshyam Sahu',
    address: 'Village - Urla, Raipur, Chhattisgarh - 493221',
    makerName: 'Hyundai',
    makerModel: 'Creta SX',
    colour: 'Titan Grey',
    seatingCapacity: 5,
    vehicleClass: 'Motor Car',
    vehicleType: 'Four Wheeler',
    ladenWeight: 1850,
    unladenWeight: 1250,
    manufactureYear: 2023,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '20-09-2023',
    saleAmount: 1650000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG04WX8901',
    vehicleNumber: 'CG04WX8901',
    dateOfRegistration: '07-02-2019',
    chassisNumber: 'MBLHA10CDJK345678',
    engineNumber: 'HA10CDJK345678',
    ownerName: 'Kavita Patel',
    sonWifeDaughterOf: 'Ashok Patel',
    address: 'Nehru Nagar, Near District Hospital, Bhilai, Chhattisgarh - 490020',
    makerName: 'Hero',
    makerModel: 'Splendor Plus',
    colour: 'Red',
    seatingCapacity: 2,
    vehicleClass: 'Motor Cycle',
    vehicleType: 'Two Wheeler',
    unladenWeight: 112,
    manufactureYear: 2019,
    vehicleCategory: 'MCWG',
    purchaseDeliveryDate: '04-02-2019',
    saleAmount: 58000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG16YZ1122',
    vehicleNumber: 'CG16YZ1122',
    dateOfRegistration: '14-12-2020',
    chassisNumber: 'MAT458642H2J56789',
    engineNumber: 'CR5F1H2J56789',
    ownerName: 'Anil Kumar Transport',
    sonWifeDaughterOf: 'Anil Kumar',
    address: 'Transport Nagar, Ambikapur, Chhattisgarh - 497001',
    makerName: 'Tata',
    makerModel: 'Ace Gold',
    colour: 'White',
    seatingCapacity: 2,
    vehicleClass: 'Light Goods Vehicle',
    vehicleType: 'Commercial Vehicle',
    ladenWeight: 1500,
    unladenWeight: 830,
    manufactureYear: 2020,
    vehicleCategory: 'LGV',
    purchaseDeliveryDate: '10-12-2020',
    saleAmount: 495000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG09AB3344',
    vehicleNumber: 'CG09AB3344',
    dateOfRegistration: '03-07-2016',
    chassisNumber: 'ME4JB522DFK876543',
    engineNumber: 'JB522DFK876543',
    ownerName: 'Sangeeta Devi',
    sonWifeDaughterOf: 'Ramlal Sahu',
    address: 'Old Basti, Near Temple, Korba, Chhattisgarh - 495677',
    makerName: 'Mahindra',
    makerModel: 'Scorpio S10',
    colour: 'Black',
    seatingCapacity: 7,
    vehicleClass: 'Light Motor Vehicle',
    vehicleType: 'Four Wheeler',
    ladenWeight: 2400,
    unladenWeight: 1795,
    manufactureYear: 2016,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '29-06-2016',
    saleAmount: 1250000,
    status: 'Cancelled'
  },
  {
    registrationNumber: 'CG31CD5566',
    vehicleNumber: 'CG31CD5566',
    dateOfRegistration: '19-04-2023',
    chassisNumber: 'MXATD11P0MA987654',
    engineNumber: 'ATDPMA987654',
    ownerName: 'Gopal Traders',
    sonWifeDaughterOf: 'Gopal Das',
    address: 'Main Market, Janjgir, Chhattisgarh - 495668',
    makerName: 'Piaggio',
    makerModel: 'Ape Auto DX',
    colour: 'Green',
    seatingCapacity: 4,
    vehicleClass: 'Auto Rickshaw',
    vehicleType: 'Three Wheeler',
    ladenWeight: 945,
    unladenWeight: 445,
    manufactureYear: 2023,
    vehicleCategory: '3W-TR',
    purchaseDeliveryDate: '15-04-2023',
    saleAmount: 295000,
    status: 'Active'
  },
  {
    registrationNumber: 'CG18EF7788',
    vehicleNumber: 'CG18EF7788',
    dateOfRegistration: '28-10-2021',
    chassisNumber: 'MA3ERLF3S00987654',
    engineNumber: 'K12MN0987654',
    ownerName: 'Madhuri Verma',
    sonWifeDaughterOf: 'Prakash Verma',
    address: 'Civil Lines, Near Collectorate, Dhamtari, Chhattisgarh - 493773',
    makerName: 'Maruti Suzuki',
    makerModel: 'Baleno Delta',
    colour: 'Nexa Blue',
    seatingCapacity: 5,
    vehicleClass: 'Motor Car',
    vehicleType: 'Four Wheeler',
    ladenWeight: 1550,
    unladenWeight: 950,
    manufactureYear: 2021,
    vehicleCategory: 'LMV-NT',
    purchaseDeliveryDate: '25-10-2021',
    saleAmount: 895000,
    status: 'Active'
  }
]

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✓ Connected to MongoDB successfully!')

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing vehicle registrations...')
    await VehicleRegistration.deleteMany({})
    console.log('✓ Cleared existing data')

    // Insert demo data
    console.log('\nInserting demo vehicle registrations...')
    const result = await VehicleRegistration.insertMany(demoRegistrations)
    console.log(`✓ Successfully inserted ${result.length} vehicle registrations!`)

    // Display summary
    console.log('\n' + '='.repeat(60))
    console.log('DEMO DATA SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Registrations Added: ${result.length}`)
    console.log('\nVehicle Numbers:')
    result.forEach((reg, index) => {
      console.log(`  ${index + 1}. ${reg.vehicleNumber} - ${reg.ownerName} (${reg.status})`)
    })
    console.log('='.repeat(60))
    console.log('\n✓ Demo data seeding completed successfully!')
    console.log('\nYou can now view the data in your Vehicle Registration page.')

  } catch (error) {
    console.error('\n✗ Error seeding database:', error.message)
    console.error('\nPlease check:')
    console.error('  1. MongoDB is running')
    console.error('  2. Connection string is correct')
    console.error('  3. Database permissions are set up correctly')
  } finally {
    // Close the connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed.')
    process.exit()
  }
}

// Run the seed function
seedDatabase()
