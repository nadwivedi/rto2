const mongoose = require('mongoose')

const fixIndexes = async () => {
  try {
    // Connect to MongoDB - update this if your connection string is different
    const mongoURI = 'mongodb://localhost:27017/rto'
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')

    // Get the Driving collection
    const db = mongoose.connection.db
    const collection = db.collection('drivings')

    // Drop the old learningLicenseNumber index
    try {
      await collection.dropIndex('learningLicenseNumber_1')
      console.log('Dropped old learningLicenseNumber index')
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message)
    }

    // Drop the old drivingLicenseNumber index (if needed)
    try {
      await collection.dropIndex('drivingLicenseNumber_1')
      console.log('Dropped old drivingLicenseNumber index')
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message)
    }

    // Create new sparse unique indexes
    await collection.createIndex(
      { learningLicenseNumber: 1 },
      { unique: true, sparse: true }
    )
    console.log('Created new sparse unique index for learningLicenseNumber')

    await collection.createIndex(
      { drivingLicenseNumber: 1 },
      { unique: true, sparse: true }
    )
    console.log('Created new sparse unique index for drivingLicenseNumber')

    console.log('\n✅ Indexes fixed successfully!')
    console.log('You can now create driving license applications without the duplicate key error.')

    process.exit(0)
  } catch (error) {
    console.error('Error fixing indexes:', error)
    process.exit(1)
  }
}

fixIndexes()
