const Tax = require('../models/Tax')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// Get all tax records
exports.getAllTax = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    // Build query
    const query = {}

    // Search by vehicle number or receipt number
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { receiptNo: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by status or pending payment
    if (status) {
      if (status === 'pending') {
        // Pending payment means balance > 0
        query.balanceAmount = { $gt: 0 }
      } else {
        // Normal status filter
        query.status = status
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const total = await Tax.countDocuments(query)

    res.json({
      success: true,
      data: taxRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + taxRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax records',
      error: error.message
    })
  }
}

// Get single tax record by ID
exports.getTaxById = async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id)

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    res.json({
      success: true,
      data: tax
    })
  } catch (error) {
    console.error('Error fetching tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax record',
      error: error.message
    })
  }
}

// Create new tax record
exports.createTax = async (req, res) => {
  try {
    const { receiptNo, vehicleNumber, ownerName, totalAmount, paidAmount, balanceAmount, taxFrom, taxTo } = req.body

    // Validate required fields
    if (!receiptNo || !vehicleNumber || !taxFrom || !taxTo) {
      return res.status(400).json({
        success: false,
        message: 'Receipt number, vehicle number, tax from, and tax to are required'
      })
    }

    // Create new tax record without bill reference first
    const tax = new Tax({
      receiptNo,
      vehicleNumber,
      ownerName,
      totalAmount: totalAmount || 0,
      paidAmount: paidAmount || 0,
      balanceAmount: balanceAmount || 0,
      taxFrom,
      taxTo,
      status: 'active'
    })

    await tax.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: `Vehicle: ${tax.vehicleNumber}`,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Tax Payment\nReceipt No: ${tax.receiptNo}\nVehicle No: ${tax.vehicleNumber}\nTax Period: ${tax.taxFrom} to ${tax.taxTo}`,
          quantity: 1,
          rate: tax.totalAmount,
          amount: tax.totalAmount
        }
      ],
      totalAmount: tax.totalAmount
    })
    await customBill.save()

    // Update tax with bill reference
    tax.bill = customBill._id
    await tax.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for tax:', tax.receiptNo)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the tax creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Tax record created successfully. Bill is being generated in background.',
      data: tax
    })
  } catch (error) {
    console.error('Error creating tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating tax record',
      error: error.message
    })
  }
}

// Update tax record
exports.updateTax = async (req, res) => {
  try {
    const { receiptNo, vehicleNumber, ownerName, totalAmount, paidAmount, balanceAmount, taxFrom, taxTo, status } = req.body

    const tax = await Tax.findById(req.params.id)

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    // Update fields
    if (receiptNo) tax.receiptNo = receiptNo
    if (vehicleNumber) tax.vehicleNumber = vehicleNumber
    if (ownerName !== undefined) tax.ownerName = ownerName
    if (taxFrom) tax.taxFrom = taxFrom
    if (taxTo) tax.taxTo = taxTo
    if (totalAmount !== undefined) tax.totalAmount = totalAmount
    if (paidAmount !== undefined) tax.paidAmount = paidAmount
    if (balanceAmount !== undefined) tax.balanceAmount = balanceAmount
    if (status) tax.status = status

    await tax.save()

    res.json({
      success: true,
      message: 'Tax record updated successfully',
      data: tax
    })
  } catch (error) {
    console.error('Error updating tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating tax record',
      error: error.message
    })
  }
}

// Delete tax record
exports.deleteTax = async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id)

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    await tax.deleteOne()

    res.json({
      success: true,
      message: 'Tax record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting tax record',
      error: error.message
    })
  }
}

// Get tax statistics
exports.getTaxStatistics = async (req, res) => {
  try {
    const total = await Tax.countDocuments()
    const active = await Tax.countDocuments({ status: 'active' })
    const expired = await Tax.countDocuments({ status: 'expired' })
    const expiring = await Tax.countDocuments({ status: 'expiring_soon' })

    // Pending payment count and amount
    const pendingPaymentRecords = await Tax.find({ balanceAmount: { $gt: 0 } })
    const pendingPaymentCount = pendingPaymentRecords.length
    const pendingPaymentAmount = pendingPaymentRecords.reduce((sum, record) => sum + (record.balanceAmount || 0), 0)

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        expiringSoon: expiring,
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching tax statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax statistics',
      error: error.message
    })
  }
}

// Get expiring tax records (expiring within 15 days)
exports.getExpiringTax = async (req, res) => {
  try {
    const today = new Date()
    const fifteenDaysLater = new Date()
    fifteenDaysLater.setDate(today.getDate() + 15)

    const allTax = await Tax.find()
    const expiringTax = allTax.filter(tax => {
      // Parse taxTo date (assuming DD/MM/YYYY or DD-MM-YYYY format)
      const dateParts = tax.taxTo.split(/[/-]/)
      const taxToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)

      return taxToDate >= today && taxToDate <= fifteenDaysLater
    })

    res.json({
      success: true,
      data: expiringTax,
      count: expiringTax.length
    })
  } catch (error) {
    console.error('Error fetching expiring tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring tax records',
      error: error.message
    })
  }
}

// Generate or regenerate bill PDF for a tax record
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const tax = await Tax.findById(id).populate('bill')
    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    let customBill = tax.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      customBill = new CustomBill({
        billNumber,
        customerName: `Vehicle: ${tax.vehicleNumber}`,
        billDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        items: [
          {
            description: `Tax Payment\nReceipt No: ${tax.receiptNo}\nVehicle No: ${tax.vehicleNumber}\nTax Period: ${tax.taxFrom} to ${tax.taxTo}`,
            quantity: 1,
            rate: tax.totalAmount || 0,
            amount: tax.totalAmount || 0
          }
        ],
        totalAmount: tax.totalAmount || 0
      })
      await customBill.save()

      tax.bill = customBill._id
      await tax.save()
    }

    // Generate or regenerate PDF
    const pdfPath = await generateCustomBillPDF(customBill)
    customBill.billPdfPath = pdfPath
    await customBill.save()

    res.status(200).json({
      success: true,
      message: 'Bill PDF generated successfully',
      data: {
        billNumber: customBill.billNumber,
        pdfPath: pdfPath,
        pdfUrl: `${req.protocol}://${req.get('host')}${pdfPath}`
      }
    })
  } catch (error) {
    console.error('Error generating bill PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill PDF',
      error: error.message
    })
  }
}

// Download bill PDF
exports.downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const tax = await Tax.findById(id).populate('bill')
    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    // Check if bill exists
    if (!tax.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found. Please generate it first.'
      })
    }

    // Check if PDF exists
    if (!tax.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', tax.bill.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${tax.bill.billNumber}_${tax.vehicleNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading bill PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download bill PDF',
      error: error.message
    })
  }
}
