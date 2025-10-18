const mongoose = require('mongoose')

const vehicleRegistrationSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  dateOfRegistration: {
    type: String,
    required: true
  },
  chassisNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  engineNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  relationOf: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  makerName: {
    type: String,
    required: true,
    trim: true
  },
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  colour: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Transferred', 'Cancelled', 'Scrapped'],
    default: 'Active'
  }
}, {
  timestamps: true
})

// Index for faster searches
vehicleRegistrationSchema.index({ registrationNumber: 1 })
vehicleRegistrationSchema.index({ chassisNumber: 1 })
vehicleRegistrationSchema.index({ ownerName: 1 })

module.exports = mongoose.model('VehicleRegistration', vehicleRegistrationSchema)
