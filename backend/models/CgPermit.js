const mongoose = require('mongoose')

const CgPermitSchema = new mongoose.Schema({
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
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Type - Always "Type A" (hardcoded, 5 year validity)
  permitType: {
    type: String,
    default: 'Type A',
    enum: ['Type A']
  },

  // Validity in years
  validityPeriod: {
    type: Number,
    default: 5
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
    trim: true,
    default: 'Chhattisgarh'
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
  vehicleType: {
    type: String,
    trim: true
  },
  vehicleClass: {
    type: String,
    default: 'Goods Vehicle'
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
    type: String,
    default: '2'
  },

  // Route & Goods
  goodsType: {
    type: String,
    default: 'General Goods'
  },
  route: {
    type: String,
    default: 'Chhattisgarh State'
  },
  maxLoadCapacity: {
    type: String
  },
  validRoutes: {
    type: String,
    default: 'All State Highways and District Roads in Chhattisgarh'
  },
  restrictions: {
    type: String,
    default: 'As per RTO regulations'
  },
  conditions: {
    type: String,
    default: 'Valid for goods transportation within Chhattisgarh state only. Driver must carry valid driving license and vehicle documents.'
  },
  endorsements: {
    type: String,
    default: 'None'
  },

  // Issuing Details
  issuingAuthority: {
    type: String,
    default: 'Regional Transport Office, Chhattisgarh'
  },
  issueDate: {
    type: String,
    required: true
  },

  // Fees
  fees: {
    type: Number,
    required: true,
    default: 10000
  },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Pending Renewal', 'Expiring Soon', 'Expired', 'Suspended'],
    default: 'Active'
  },

  // Renewal History
  renewalHistory: [{
    date: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed'
    }
  }],

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

  // Tax Details
  taxDetails: {
    taxPaidUpto: {
      type: String
    },
    taxAmount: {
      type: String
    }
  },

  // Document Uploads
  documents: {
    permitDocument: String
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
CgPermitSchema.index({ permitNumber: 1 })
CgPermitSchema.index({ permitHolder: 1 })
CgPermitSchema.index({ vehicleNumber: 1 })
CgPermitSchema.index({ status: 1 })

// Method to check if permit is expiring soon (within 30 days)
CgPermitSchema.methods.isExpiringSoon = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((validToDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0
}

// Method to check if permit is expired
CgPermitSchema.methods.isExpired = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  return validToDate < today
}

// Pre-save middleware to auto-update status based on validity
CgPermitSchema.pre('save', function (next) {
  if (this.isExpired()) {
    this.status = 'Expired'
  } else if (this.isExpiringSoon()) {
    this.status = 'Expiring Soon'
  }
  next()
})

const CgPermit = mongoose.model('CgPermit', CgPermitSchema)

module.exports = CgPermit
