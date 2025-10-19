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



  // Additional Details (Optional)
  fatherName: {
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




const CgPermit = mongoose.model('CgPermit', CgPermitSchema)

module.exports = CgPermit
