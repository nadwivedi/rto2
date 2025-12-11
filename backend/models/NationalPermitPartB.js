const mongoose = require('mongoose')

const NationalPermitPartBSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Link to Part A (ObjectId reference for population)
  partAId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NationalPermitPartA',
    index: true
  },

  // Link to Part A (String for backward compatibility and quick lookups)
  permitNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // Part B Number (same as authorization number)
  partBNumber: {
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

  // Fees (Optional - only for renewals)
  totalFee: {
    type: Number
  },
  paid: {
    type: Number
  },
  balance: {
    type: Number
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
    partBImage: String
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
NationalPermitPartBSchema.index({ vehicleNumber: 1 })
NationalPermitPartBSchema.index({ permitNumber: 1 })
NationalPermitPartBSchema.index({ partBNumber: 1 })
NationalPermitPartBSchema.index({ validTo: 1 })
NationalPermitPartBSchema.index({ balance: 1 })
NationalPermitPartBSchema.index({ createdAt: -1 })

const NationalPermitPartB = mongoose.model('NationalPermitPartB', NationalPermitPartBSchema)

module.exports = NationalPermitPartB
