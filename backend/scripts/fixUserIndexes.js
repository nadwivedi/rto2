require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`mongodb://localhost:27017/rto2`)
    console.log('Connected to MongoDB')

    // Get all indexes on the User collection
    const indexes = await User.collection.getIndexes()
    console.log('\nCurrent indexes:')
    console.log(JSON.stringify(indexes, null, 2))

    // Drop any unwanted indexes
    console.log('\nDropping unwanted indexes...')

    // Check for 'mobile' index (old field)
    if (indexes.mobile || indexes.mobile_1) {
      try {
        await User.collection.dropIndex('mobile_1')
        console.log('✓ Dropped index: mobile_1')
      } catch (err) {
        console.log('- Index mobile_1 does not exist or already dropped')
      }
    }

    // Check for mobile2 unique index (should not be unique)
    if (indexes.mobile2_1) {
      try {
        await User.collection.dropIndex('mobile2_1')
        console.log('✓ Dropped index: mobile2_1')
      } catch (err) {
        console.log('- Index mobile2_1 does not exist or already dropped')
      }
    }

    // Sync indexes with the schema
    console.log('\nSyncing indexes with schema...')
    await User.syncIndexes()
    console.log('✓ Indexes synced successfully')

    // Display final indexes
    const finalIndexes = await User.collection.getIndexes()
    console.log('\nFinal indexes:')
    console.log(JSON.stringify(finalIndexes, null, 2))

    console.log('\n✓ Index fix completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error fixing indexes:', error)
    process.exit(1)
  }
}

fixIndexes()
