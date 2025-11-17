const mongoose = require('mongoose')

const customBillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    billNumber: {
      type: Number,
      required: true
    },
    billPdfPath: {
      type: String
    },
    billDate: {
      type: String
    },
    customerName: {
      type: String,
      required: true
    },
    items: [
      {
        description: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        },
        rate: {
          type: Number,
          default: 0
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Compound unique index to ensure billNumber is unique per user
customBillSchema.index({ userId: 1, billNumber: 1 }, { unique: true })
customBillSchema.index({ customerName: 1 })
customBillSchema.index({ createdAt: -1 })

const CustomBill = mongoose.model('CustomBill', customBillSchema)

module.exports = CustomBill
