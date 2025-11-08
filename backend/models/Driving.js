const mongoose = require('mongoose')

const DrivingSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },

  // Contact Information
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },

  // License Information

  licenseClass: {
    type: String,
    required: true,
    enum: ['MCWG', 'LMV', 'MCWG+LMV', 'HMV', 'Commercial', 'Transport'],
    // MCWG = Two Wheeler, LMV = Light Motor Vehicle (Four Wheeler)
  },

  // Driving License Details
  LicenseNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  LicenseIssueDate: {
    type: Date
  },
  LicenseExpiryDate: {
    type: Date
  },

  // Learning License Details
  learningLicenseNumber: {
    type: String,
    trim: true
  },
  learningLicenseIssueDate: {
    type: Date
  },
  learningLicenseExpiryDate: {
    type: Date
  },

  // Payment Information
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0
  },
  balanceAmount: {
    type: Number,
    required: true,
    default: 0
  },


  // Educational Information
  qualification: {
    type: String,
    enum: ['Below 10th', '10th Pass', '12th Pass', 'Graduate', 'Post Graduate']
  },

  // Identification
  aadharNumber: {
    type: String,
    trim: true
  },
  

  // Documents (store file paths or URLs)
  documents: {
    photo: String,
    signature: String,
    aadharCard: String,
  },

  
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
})




const Driving = mongoose.model('Driving', DrivingSchema)

module.exports = Driving