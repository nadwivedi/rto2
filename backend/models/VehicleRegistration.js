const mongoose = require('mongoose')

const vehicleRegistrationSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    uppercase: true,
    trim: true
  },
  dateOfRegistration: {
    type: String
  },
  chassisNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  engineNumber: {
    type: String,
    uppercase: true,
    trim: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  sonWifeDaughterOf: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  makerName: {
    type: String,
    trim: true
  },
  modelName: {
    type: String,
    trim: true
  },
  makerModel: {
    type: String,
    trim: true
  },
  colour: {
    type: String,
    trim: true
  },
  seatingCapacity: {
    type: Number
  },
  vehicleClass: {
    type: String,
    trim: true
  },
  ladenWeight: {
    type: Number
  },
  unladenWeight: {
    type: Number
  },
  manufactureYear: {
    type: Number
  },
  vehicleCategory: {
    type: String,
    trim: true
  },
  purchaseDeliveryDate: {
    type: String
  },
  saleAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Active', 'Transferred', 'Cancelled', 'Scrapped'],
    default: 'Active'
  }
}, {
  timestamps: true
})



module.exports = mongoose.model('VehicleRegistration', vehicleRegistrationSchema)
