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

  mobileNumber: {
    type: String,
    trim: true
  },


  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
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
    enum: ['active', 'expired', 'expiring_soon', 'cancelled'],
    default: 'active'
  },

  // Additional Information
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
})



const Insurance = mongoose.model('Insurance', InsuranceSchema)

module.exports = Insurance
