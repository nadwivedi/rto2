const mongoose = require('mongoose')
const readline = require('readline')
const Admin = require('../models/Admin')

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Function to ask questions
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto'

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get admin details
    console.log('=== Create New Admin User ===\n')

    const name = await question('Enter admin name: ')
    const username = await question('Enter username: ')
    const email = await question('Enter email: ')
    const password = await question('Enter password: ')
    const confirmPassword = await question('Confirm password: ')

    // Validate inputs
    if (!name || !username || !email || !password) {
      console.error('\n❌ All fields are required!')
      rl.close()
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Passwords do not match!')
      rl.close()
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('\n❌ Password must be at least 6 characters long!')
      rl.close()
      process.exit(1)
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    })

    if (existingAdmin) {
      console.error('\n❌ Admin with this username or email already exists!')
      rl.close()
      process.exit(1)
    }

    // Create admin
    const admin = new Admin({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true
    })

    await admin.save()

    console.log('\n✅ Admin user created successfully!')
    console.log('\nAdmin Details:')
    console.log('---------------')
    console.log(`Name: ${admin.name}`)
    console.log(`Username: ${admin.username}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Role: ${admin.role}`)
    console.log('\nYou can now login with these credentials.\n')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message)
    rl.close()
    process.exit(1)
  }
}

// Run the script
createAdmin()
