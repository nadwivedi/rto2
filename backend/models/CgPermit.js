const mongoose = require('mongoose')

const CgPermitSchema = new mongoose.Schema({
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
    index: true
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
  mobileNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  // Fees
  totalFee: {
    type: Number,
    required: true,
  },
  paid: {
    type: Number,
    required: true,
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

  // Renewal status - set to true when this permit has been renewed
  isRenewed: {
    type: Boolean,
    default: false
  },

  // Document Uploads
  documents: {
    permitDocument: String
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
// 1. Get all permits with pending payment (balance > 0)
// 2. Get all permits with expiring/expired status (filter by validTo date)
// 3. Search vehicle number and get all permit records for that vehicle

// Index 1: vehicleNumber (for searching vehicle and getting all its permit records)
CgPermitSchema.index({ vehicleNumber: 1 })

// Index 2: validTo (for filtering expired/expiring_soon/active status)
CgPermitSchema.index({ validTo: 1 })

// Index 3: balance (for filtering pending payments)
CgPermitSchema.index({ balance: 1 })

// Index 4: createdAt (for default sorting - newest first)
CgPermitSchema.index({ createdAt: -1 })

const CgPermit = mongoose.model('CgPermit', CgPermitSchema)

module.exports = CgPermit
