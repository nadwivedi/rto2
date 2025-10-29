const mongoose = require('mongoose')

const fitnessSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true,
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
  fee: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

const Fitness = mongoose.model('Fitness', fitnessSchema)

module.exports = Fitness
