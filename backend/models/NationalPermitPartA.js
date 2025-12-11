const mongoose = require('mongoose')

const NationalPermitPartASchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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

  // Fees (Optional - payment tracking now done in Part B)
  totalFee: {
    type: Number,
    default: 0
  },
  paid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
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
