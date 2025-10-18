const mongoose = require('mongoose')

// Type B Authorization Schema (1 year validity)
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

}, { _id: false })

const NationalPermitSchema = new mongoose.Schema({
  // Basic Permit Information
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

  // Vehicle Details
  vehicleNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  vehicleModel: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Container Truck', 'Multi-axle Truck', 'Tanker', 'Bus', 'Tempo', ''],
    default: ''
  },
  vehicleClass: {
    type: String,
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
    type: Number // in kg
  },
  grossWeight: {
    type: Number // in kg
  },
  yearOfManufacture: {
    type: String
  },
  seatingCapacity: {
    type: String,
    default: '2'
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
  issueDate: {
    type: String,
    required: true
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


  // Document Uploads
  documents: {
    partAImage: String,
    partBImage: String
  },


}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
})



const NationalPermit = mongoose.model('NationalPermit', NationalPermitSchema)

module.exports = NationalPermit
