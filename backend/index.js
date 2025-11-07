require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./utils/mongodb')

const app = express()
const PORT = process.env.PORT

// CORS configuration
const allowedOrigins = [
  'https://rtoapi.winners11.in',
  'https://rto.winners11.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (PDFs) from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      // Allow inline viewing but also enable download
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
    }
  }
}))

// MongoDB Connection
connectDB()

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
const insuranceRoutes = require('./routes/insurance')
const importRoutes = require('./routes/import')

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
app.use('/api/insurance', insuranceRoutes)
app.use('/api/import', importRoutes)

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
      tax: '/api/tax',
      insurance: '/api/insurance',
      import: '/api/import'
    }
  })
})

// Simple error handling middleware - fallback only
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    errors: [err.message || 'Internal server error'],
    errorCount: 1,
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
