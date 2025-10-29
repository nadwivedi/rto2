const mongoose = require('mongoose')


const PartARenewalSchema = new mongoose.Schema({
  permitNumber: {
    type: String,
    required: true,
    trim: true
  },
  renewalDate: {
    type: Date,
    default: Date.now
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },
  fees: {
    type: Number,
    required: true,
    default: 15000 // Part A renewal fee (5 years)
  },
  billNumber: {
    type: String,
    required: true,
    trim: true
  },
  billPdfPath: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Paid'
  },
  notes: {
    type: String,
    trim: true
  },
  isOriginal: {
    type: Boolean,
    default: false // True for the original Part A created with the initial permit
  }
}, { _id: true, timestamps: true })


const PartBRenewalSchema = new mongoose.Schema({
  authorizationNumber: {
    type: String,
    required: true,
    trim: true
  },
  renewalDate: {
    type: Date,
    default: Date.now
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },
  fees: {
    type: Number,
    required: true,
    default: 5000 // Part B renewal fee
  },
  billNumber: {
    type: String,
    required: true,
    trim: true
  },
  billPdfPath: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Paid'
  },
  notes: {
    type: String,
    trim: true
  },
  isOriginal: {
    type: Boolean,
    default: false // True for the original Part B created with the initial permit
  }
}, { _id: true, timestamps: true })


const TypeBAuthorizationSchema = new mongoose.Schema({
  authorizationNumber: {
    type: String,
    required: true,
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
  // Track renewal history
  renewalHistory: {
    type: [PartBRenewalSchema],
    default: []
  }
}, { _id: false })

const NationalPermitSchema = new mongoose.Schema({
  // Vehicle Reference (Link to VehicleRegistration)
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },

  // Basic Permit Information
  permitNumber: {
    type: String,
    required: true,
    trim: true
  },
  permitHolder: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },

  // Contact Information
  address: {
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
  
  // Permit Validity (Part A - 5 years)
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Part A Renewal History
  partARenewalHistory: {
    type: [PartARenewalSchema],
    default: []
  },

  // Route Information

  // Type B Authorization (1 year validity) - Structured as separate schema
  typeBAuthorization: {
    type: TypeBAuthorizationSchema,
    required: true
  },

  // Permit Status
  status: {
    type: String,
    enum: ['Active', 'Pending Renewal', 'Expiring Soon', 'Expired', 'Suspended'],
    default: 'Active'
  },


  // Fees
  fees: {
    type: Number,
    required: true,
    default: 15000
  },

  // Bill Information
  billNumber: {
    type: String,
    trim: true
  },
  billPdfPath: {
    type: String,
    default: null // Path to generated PDF: /uploads/bills/BILL-2025-0001.pdf
  },

  // Document Uploads
  documents: {
    partAImage: String,
    partBImage: String
  },


}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})



const NationalPermit = mongoose.model('NationalPermit', NationalPermitSchema)

module.exports = NationalPermit
