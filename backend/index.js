const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (PDFs) from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      // Allow inline viewing but also enable download
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
    }
  }
}))

// CORS middleware (allow admin panel to connect)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Import Routes
const authRoutes = require('./routes/auth')
const drivingLicenseRoutes = require('./routes/drivingLicense')
const nationalPermitRoutes = require('./routes/nationalPermit')
const cgPermitRoutes = require('./routes/cgPermit')
const temporaryPermitRoutes = require('./routes/temporaryPermit')
const vehicleRegistrationRoutes = require('./routes/vehicleRegistration')
const fitnessRoutes = require('./routes/fitness')
const customBillRoutes = require('./routes/customBill')
const taxRoutes = require('./routes/tax')

// Use Routes
app.use('/api/auth', authRoutes)
app.use('/api/driving-licenses', drivingLicenseRoutes)
app.use('/api/national-permits', nationalPermitRoutes)
app.use('/api/cg-permits', cgPermitRoutes)
app.use('/api/temporary-permits', temporaryPermitRoutes)
app.use('/api/vehicle-registrations', vehicleRegistrationRoutes)
app.use('/api/fitness', fitnessRoutes)
app.use('/api/custom-bills', customBillRoutes)
app.use('/api/tax', taxRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'RTO Management System API',
    version: '1.0.0',
    endpoints: {
      drivingLicenses: '/api/driving-licenses',
      nationalPermits: '/api/national-permits',
      cgPermits: '/api/cg-permits',
      temporaryPermits: '/api/temporary-permits',
      vehicleRegistrations: '/api/vehicle-registrations',
      fitness: '/api/fitness',
      customBills: '/api/custom-bills',
      tax: '/api/tax'
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
