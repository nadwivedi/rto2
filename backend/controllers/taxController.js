const Tax = require('../models/Tax')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// helper function to calculate status
const getTaxStatus = (taxTo) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(23, 59, 59, 999);

  // a little utility function to parse dates consistently
  const parseDate = (dateString) => {
      const parts = dateString.split(/[-/]/);
      // new Date(year, monthIndex, day)
      return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const taxToDate = parseDate(taxTo);

  if (taxToDate < today) {
    return 'expired';
  } else if (taxToDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};

// Get all tax records
exports.getAllTax = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = {}

    // Search by vehicle number
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

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

    // Calculate status
    const status = getTaxStatus(taxTo);

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
      status
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
    const { receiptNo, vehicleNumber, ownerName, totalAmount, paidAmount, balanceAmount, taxFrom, taxTo } = req.body

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
    if (taxTo) {
        tax.taxTo = taxTo
        // Recalculate status if taxTo is updated
        tax.status = getTaxStatus(taxTo);
    }
    if (totalAmount !== undefined) tax.totalAmount = totalAmount
    if (paidAmount !== undefined) tax.paidAmount = paidAmount
    if (balanceAmount !== undefined) tax.balanceAmount = balanceAmount

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
    // Count permits by status (now using the indexed status field)
    const activeTax = await Tax.countDocuments({ status: 'active' })
    const expiringSoonTax = await Tax.countDocuments({ status: 'expiring_soon' })
    const expiredTax = await Tax.countDocuments({ status: 'expired' })
    const total = await Tax.countDocuments()

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { balanceAmount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balanceAmount' }
        }
      }
    ]

    const pendingPaymentResults = await Tax.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    res.json({
      success: true,
      data: {
        total,
        active: activeTax,
        expired: expiredTax,
        expiringSoon: expiringSoonTax,
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
// Get expiring soon tax records
exports.getExpiringSoonTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'taxTo', sortOrder = 'asc' } = req.query

    const query = { status: 'expiring_soon' }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

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
    console.error('Error fetching expiring soon tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon tax records',
      error: error.message
    })
  }
};

// Get expired tax records
exports.getExpiredTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'taxTo', sortOrder = 'desc' } = req.query

    const query = { status: 'expired' }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

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
    console.error('Error fetching expired tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired tax records',
      error: error.message
    })
  }
};

// Get pending payment tax records
exports.getPendingPaymentTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { balanceAmount: { $gt: 0 } }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

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
    console.error('Error fetching pending payment tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payment tax records',
      error: error.message
    })
  }
};
