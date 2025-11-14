const mongoose = require('mongoose')

const NationalPermitPartASchema = new mongoose.Schema({
  // Essential Information
  permitNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
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

  // Additional Details
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

  // Fees (ALWAYS required - either combined or Part A only)
  totalFee: {
    type: Number,
    required: true
  },
  paid: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },

  // Bill Reference (Optional for now)
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

  // Documents
  documents: {
    partAImage: String
  },

  // Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Optimized indexes
NationalPermitPartASchema.index({ vehicleNumber: 1 })
NationalPermitPartASchema.index({ permitNumber: 1 })
NationalPermitPartASchema.index({ validTo: 1 })
NationalPermitPartASchema.index({ balance: 1 })
NationalPermitPartASchema.index({ createdAt: -1 })

const NationalPermitPartA = mongoose.model('NationalPermitPartA', NationalPermitPartASchema)

module.exports = NationalPermitPartA
