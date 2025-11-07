const mongoose = require('mongoose')

const TemporaryPermitSchema = new mongoose.Schema({
  // Essential Information (Required)
  permitNumber: {
    type: String,
    required: true,
    unique: true,
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
  vehicleType: {
    type: String,
    required: true,
    enum: ['CV', 'PV'], // CV = Commercial Vehicle, PV = Passenger Vehicle
    uppercase: true
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Validity period in months (auto-set based on vehicle type)
  validityPeriod: {
    type: Number,
    required: true
  },

  // Additional Details (Optional)
  fatherName: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
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

  // Permit Details
 
  issueDate: {
    type: String,
    required: true
  },

  // Fees
  totalFee: {
    type: Number,
    required: true,
    default: 1000
  },
  paid: {
    type: Number,
    required: true,
    default: 0
  },
  balance: {
    type: Number,
    required: true,
    default: 1000
  },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired', 'Cancelled'],
    default: 'Active'
  },

  // Bill Reference
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomBill'
  },


  // Admin Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for faster searches
TemporaryPermitSchema.index({ permitNumber: 1 })
TemporaryPermitSchema.index({ permitHolder: 1 })
TemporaryPermitSchema.index({ vehicleNumber: 1 })
TemporaryPermitSchema.index({ status: 1 })
TemporaryPermitSchema.index({ vehicleType: 1 })

// Method to check if permit is expiring soon (within 7 days)
TemporaryPermitSchema.methods.isExpiringSoon = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((validToDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0
}

// Method to check if permit is expired
TemporaryPermitSchema.methods.isExpired = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  return validToDate < today
}

// Pre-save middleware to auto-update status based on validity
TemporaryPermitSchema.pre('save', function (next) {
  if (this.isExpired()) {
    this.status = 'Expired'
  } else if (this.isExpiringSoon()) {
    this.status = 'Expiring Soon'
  }
  next()
})

const TemporaryPermit = mongoose.model('TemporaryPermit', TemporaryPermitSchema)

module.exports = TemporaryPermit
