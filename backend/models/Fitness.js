const mongoose = require('mongoose')

const fitnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true,
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
  },
  paid: {
    type: Number,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'expiring_soon'],
    default: 'active'
  },

  // Renewal status - set to true when this fitness has been renewed
  isRenewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Optimized indexes for exact requirements:
// 1. Get all vehicles with pending payment (balance > 0)
// 2. Get all vehicles with expiring/expired fitness (filter by validTo date)
// 3. Search vehicle number and get all fitness records for that vehicle

// Index 1: vehicleNumber (for searching vehicle and getting all its fitness records)
fitnessSchema.index({ vehicleNumber: 1 })

// Index 2: validTo (for filtering expired/expiring_soon/active status)
fitnessSchema.index({ validTo: 1 })

// Index 3: balance (for filtering pending payments)
fitnessSchema.index({ balance: 1 })

// Index 4: createdAt (for default sorting - newest first)
fitnessSchema.index({ createdAt: -1 })

const Fitness = mongoose.model('Fitness', fitnessSchema)

module.exports = Fitness
