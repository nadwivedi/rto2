const mongoose = require('mongoose')
require('dotenv').config()

const User = require('./backend/models/User')
const Employee = require('./backend/models/Employee')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rto2')
  
  const user = await User.findOne({})
  if (!user) {
    console.log("No admin user found")
    process.exit(1)
  }
  
  const result = await Employee.updateMany(
    { adminId: { $exists: false } },
    { $set: { adminId: user._id } }
  )
  
  console.log(`Updated ${result.modifiedCount} employees with adminId ${user._id}`)
  process.exit(0)
}

run()
