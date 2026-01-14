const mongoose = require('mongoose')

const BusPermitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Essential Information (Required)
  permitNumber: {
    type: String,
    required: false,
    trim: true
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

  // Bus-specific fields
  routeFrom: {
    type: String,
    required: true,
    trim: true
  },
  routeTo: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['AC', 'DELUX', 'SLEEPER', 'ORDINARY', 'SCHOOL BUS'],
    required: true
  },

  // Additional Details (Optional)
  mobileNumber: {
    type: String,
    trim: true
  },

  // Fees
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

  // Status (managed by cron job)
  status: {
    type: String,
    enum: ['active', 'expiring_soon', 'expired'],
    default: 'active',
    index: true
  },

  // Renewal status - set to true when this permit has been renewed
  isRenewed: {
    type: Boolean,
    default: false
  },

  // Document Uploads
  documents: {
    permitDocument: String
  },

  // Admin Notes
  notes: {
    type: String,
    trim: true
  },

  // WhatsApp message tracking
  whatsappMessageCount: {
    type: Number,
    default: 0
  },
  lastWhatsappSentAt: {
    type: Date
  }
}, {
  timestamps: true
})


// Index 1: vehicleNumber (for searching vehicle and getting all its permit records)
BusPermitSchema.index({ vehicleNumber: 1 })

// Index 2: validTo (for filtering expired/expiring_soon/active status)
BusPermitSchema.index({ validTo: 1 })

// Index 3: balance (for filtering pending payments)
BusPermitSchema.index({ balance: 1 })

// Index 4: createdAt (for default sorting - newest first)
BusPermitSchema.index({ createdAt: -1 })

const BusPermit = mongoose.model('BusPermit', BusPermitSchema)

module.exports = BusPermit
