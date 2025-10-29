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

    // Customer Information
    customerName: {
      type: String,
      required: true
    },

    // Bill Items with checkbox approach and amounts
    items: {
      permit: {
        isIncluded: {
          type: Boolean,
          default: false
        },
        amount: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      fitness: {
        isIncluded: {
          type: Boolean,
          default: false
        },
        amount: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      vehicleRegistration: {
        isIncluded: {
          type: Boolean,
          default: false
        },
        amount: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      temporaryRegistration: {
        isIncluded: {
          type: Boolean,
          default: false
        },
        amount: {
          type: Number,
          default: 0,
          min: 0
        }
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
dealerBillSchema.index({ customerName: 1 })
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
