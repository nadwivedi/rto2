const mongoose = require('mongoose')

const dealerBillSchema = new mongoose.Schema(
  {
    // Bill Information
    billNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    billPdfPath: {
      type: String
    },

    // Permit Information (Flexible for any permit type)
    permit: {
      permitType: {
        type: String,
        enum: ['National Permit', 'CG Permit', 'Temporary Permit'],
        required: true
      },
      // For National Permit: partANumber and partBNumber
      // For CG/Temporary Permit: permitNumber
      permitNumber: {
        type: String
      },
      partANumber: {
        type: String
      },
      partBNumber: {
        type: String
      }
    },

    // Fitness Information
    fitness: {
      certificateNumber: {
        type: String,
        required: true
      }
    },

    // Vehicle Registration Information
    registration: {
      registrationNumber: {
        type: String,
        required: true
      }
    },

    // Financial Information
    totalFees: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceAmount: {
      type: Number,
      default: function() {
        return this.totalFees - this.paidAmount
      }
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'],
      default: 'Pending'
    },

    // Status
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active'
    },

    // Notes
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Indexes for faster queries
dealerBillSchema.index({ billNumber: 1 })
dealerBillSchema.index({ 'permit.permitNumber': 1 })
dealerBillSchema.index({ 'permit.partANumber': 1 })
dealerBillSchema.index({ 'permit.partBNumber': 1 })
dealerBillSchema.index({ 'fitness.certificateNumber': 1 })
dealerBillSchema.index({ 'registration.registrationNumber': 1 })
dealerBillSchema.index({ paymentStatus: 1 })
dealerBillSchema.index({ status: 1 })
dealerBillSchema.index({ createdAt: -1 })

// Pre-save middleware to calculate balance amount
dealerBillSchema.pre('save', function(next) {
  if (this.isModified('totalFees') || this.isModified('paidAmount')) {
    this.balanceAmount = this.totalFees - this.paidAmount
  }
  next()
})

const DealerBill = mongoose.model('DealerBill', dealerBillSchema)

module.exports = DealerBill
