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
  status: {
    type: String,
    enum: ['active', 'expired', 'expiring_soon'],
    default: 'active'
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomBill'
  }
}, {
  timestamps: true
})

const Fitness = mongoose.model('Fitness', fitnessSchema)

module.exports = Fitness
