const mongoose = require('mongoose')

const taxSchema = new mongoose.Schema({
  // Vehicle Reference
  vehicleNumber: {
    type: String,
    ref: 'VehicleRegistration',
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },

  // Challan/Receipt Information
  challanNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  // Tax Period (Quarterly - 3 months)
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4'], // Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
    required: true
  },
  financialYear: {
    type: String,
    required: true,
    trim: true // Format: "2024-25"
  },
  validFrom: {
    type: String,
    required: true
  },
  validTo: {
    type: String,
    required: true
  },

  // Tonnage Calculation (200 Rs per ton)
  vehicleWeight: {
    type: Number,
    required: true,
    min: 0 // Weight in tons
  },
  ratePerTon: {
    type: Number,
    required: true,
    default: 200 // 200 Rs per ton
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0 // Will be calculated as vehicleWeight * ratePerTon
  },

  // Additional Charges
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeesAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  otherCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0 // taxAmount + penaltyAmount + lateFeesAmount + otherCharges
  },

  // Payment Information
  paymentDate: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Paid'
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'UPI', 'Cheque', 'DD', 'Card'],
    default: 'Cash'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Bill/Document Information
  billNumber: {
    type: String,
    trim: true
  },
  billPdfPath: {
    type: String,
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Expiring Soon', 'Cancelled'],
    default: 'Active'
  },

  // Additional Information
  issuedBy: {
    type: String,
    trim: true,
    default: 'RTO Office'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for faster searches
taxSchema.index({ vehicleNumber: 1 })
taxSchema.index({ challanNumber: 1 })
taxSchema.index({ quarter: 1 })
taxSchema.index({ financialYear: 1 })
taxSchema.index({ validTo: 1 })
taxSchema.index({ status: 1 })
taxSchema.index({ paymentStatus: 1 })
// Compound index for searching tax by vehicle and period
taxSchema.index({ vehicleNumber: 1, quarter: 1, financialYear: 1 })

// Method to check if tax is expiring soon (within 30 days)
taxSchema.methods.isExpiringSoon = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((validToDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0
}

// Method to check if tax is expired
taxSchema.methods.isExpired = function () {
  const validToDate = new Date(this.validTo)
  const today = new Date()
  return validToDate < today
}

// Method to calculate tax amount based on vehicle weight
taxSchema.methods.calculateTaxAmount = function () {
  return this.vehicleWeight * this.ratePerTon
}

// Method to calculate total amount
taxSchema.methods.calculateTotalAmount = function () {
  return this.taxAmount + this.penaltyAmount + this.lateFeesAmount + this.otherCharges
}

// Method to calculate balance amount
taxSchema.methods.calculateBalanceAmount = function () {
  return this.totalAmount - this.paidAmount
}

// Static method to get next quarter
taxSchema.statics.getNextQuarter = function (currentQuarter) {
  const quarters = { Q1: 'Q2', Q2: 'Q3', Q3: 'Q4', Q4: 'Q1' }
  return quarters[currentQuarter]
}

// Static method to get quarter from date
taxSchema.statics.getQuarterFromDate = function (date) {
  const month = new Date(date).getMonth() + 1
  if (month >= 1 && month <= 3) return 'Q1'
  if (month >= 4 && month <= 6) return 'Q2'
  if (month >= 7 && month <= 9) return 'Q3'
  return 'Q4'
}

// Pre-save middleware to auto-calculate amounts
taxSchema.pre('save', function (next) {
  // Auto-calculate tax amount if not set
  if (!this.taxAmount || this.taxAmount === 0) {
    this.taxAmount = this.calculateTaxAmount()
  }

  // Auto-calculate total amount
  this.totalAmount = this.calculateTotalAmount()

  // Auto-calculate balance amount
  this.balanceAmount = this.calculateBalanceAmount()

  // Update payment status based on payment
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid'
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partial'
  } else if (this.isExpired() && this.paidAmount === 0) {
    this.paymentStatus = 'Overdue'
  }

  // Update status based on validity
  if (this.isExpired()) {
    this.status = 'Expired'
  } else if (this.isExpiringSoon()) {
    this.status = 'Expiring Soon'
  } else {
    this.status = 'Active'
  }

  next()
})

const Tax = mongoose.model('Tax', taxSchema)

module.exports = Tax
