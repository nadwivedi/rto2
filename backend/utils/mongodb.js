const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto'

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(' MongoDB connected successfully')
  } catch (error) {
    console.error('L MongoDB connection error:', error)
    process.exit(1)
  }
}

module.exports = connectDB
