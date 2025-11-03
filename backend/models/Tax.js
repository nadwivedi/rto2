const mongoose = require('mongoose')

const taxSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0
  },
  taxFrom: {
    type: String,
    required: true
  },
  taxTo: {
    type: String,
    required: true
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

const Tax = mongoose.model('Tax', taxSchema)

module.exports = Tax
