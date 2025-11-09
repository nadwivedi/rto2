const mongoose = require('mongoose')

const TemporaryPermitSchema = new mongoose.Schema({
  // Essential Information (Required)
  permitNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  permitHolder: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    trim: true,
    uppercase: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['CV', 'PV'], // CV = Commercial Vehicle, PV = Passenger Vehicle
    uppercase: true
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Additional Details (Optional)
  fatherName: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },

  mobileNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  // Vehicle Details (Optional)
  chassisNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  engineNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  ladenWeight: {
    type: Number
  },
  unladenWeight: {
    type: Number
  },

  
  // Fees
  totalFee: {
    type: Number,
    required: true,
  },
  paid: {
    type: Number,
    required: true,
    default: 0
  },
  balance: {
    type: Number,
    required: true,
  },

  // Bill Reference
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomBill'
  },

  // Status (managed by cron job)
  status: {
    type: String,
    enum: ['active', 'expiring_soon', 'expired'],
    default: 'active',
    index: true
  },

  // Admin Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Optimized indexes for exact requirements:
// 1. Get all vehicles with pending payment (balance > 0)
// 2. Get all vehicles with expiring/expired permits (filter by validTo date)
// 3. Search vehicle number and get all permit records for that vehicle

// Index 1: vehicleNumber (for searching vehicle and getting all its permit records)
TemporaryPermitSchema.index({ vehicleNumber: 1 })

// Index 2: validTo (for filtering expired/expiring_soon/active status)
TemporaryPermitSchema.index({ validTo: 1 })

// Index 3: balance (for filtering pending payments)
TemporaryPermitSchema.index({ balance: 1 })

// Index 4: createdAt (for default sorting - newest first)
TemporaryPermitSchema.index({ createdAt: -1 })

const TemporaryPermit = mongoose.model('TemporaryPermit', TemporaryPermitSchema)

module.exports = TemporaryPermit
