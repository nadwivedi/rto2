const mongoose = require('mongoose')

const InsuranceSchema = new mongoose.Schema({
  // Policy Information
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  // Vehicle Information
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },

  // Owner Information
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },

  // Validity Period
  issueDate: {
    type: String,
    required: true
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Financial Details
  insuranceFee: {
    type: Number,
    required: true,
    min: 0
  },

  totalFee: {
    type: Number,
    required: true,
    default: 0
  },
  paid: {
    type: Number,
    required: true,
    default: 0
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Expiring Soon', 'Cancelled'],
    default: 'Active'
  },

  // Additional Information
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
})

// Index for faster searches
InsuranceSchema.index({ policyNumber: 1 })
InsuranceSchema.index({ vehicleNumber: 1 })
InsuranceSchema.index({ validTo: 1 })

const Insurance = mongoose.model('Insurance', InsuranceSchema)

module.exports = Insurance
