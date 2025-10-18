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
    required: true,
    trim: true,
    uppercase: true
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

  // Vehicle Details (Optional)
  vehicleModel: {
    type: String,
    trim: true
  },
  vehicleClass: {
    type: String,
    trim: true
  },
  chassisNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  engineNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  unladenWeight: {
    type: Number
  },
  grossWeight: {
    type: Number
  },
  yearOfManufacture: {
    type: String
  },
  seatingCapacity: {
    type: String
  },

  // Permit Details
  route: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  restrictions: {
    type: String,
    default: 'As per RTO regulations'
  },
  conditions: {
    type: String,
    default: 'Valid for temporary use only. Must carry valid documents.'
  },

  // Issuing Details
  issuingAuthority: {
    type: String,
    default: 'Regional Transport Office'
  },
  issueDate: {
    type: String,
    required: true
  },

  // Fees
  fees: {
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

  // Insurance Details
  insuranceDetails: {
    policyNumber: {
      type: String,
      default: 'N/A'
    },
    company: {
      type: String,
      default: 'N/A'
    },
    validUpto: {
      type: String,
      default: 'N/A'
    }
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
