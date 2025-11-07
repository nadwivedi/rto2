const CgPermit = require('../models/CgPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')
const path = require('path')
const fs = require('fs')

// Create new CG permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new CG permit without bill reference first
    const newPermit = new CgPermit(permitData)
    await newPermit.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: newPermit.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `CG Permit\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}\nRoute: Chhattisgarh State`,
          quantity: 1,
          rate: newPermit.totalFee,
          amount: newPermit.totalFee
        }
      ],
      totalAmount: newPermit.totalFee
    })
    await customBill.save()

    // Update permit with bill reference
    newPermit.bill = customBill._id
    await newPermit.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for CG permit:', newPermit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the permit creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'CG permit created successfully. Bill is being generated in background.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get all CG permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}

    // Search by permit number, permit holder, vehicle number
    if (search) {
      query.$or = [
        { permitNumber: { $regex: search, $options: 'i' } },
        { permitHolder: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by status or pending payment
    if (status) {
      if (status === 'pending') {
        // Pending payment means balance > 0
        query.balance = { $gt: 0 }
      } else {
        // Normal status filter
        query.status = status
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await CgPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await CgPermit.countDocuments(query)

    res.status(200).json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching CG permits:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get single CG permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get CG permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await CgPermit.findOne({ permitNumber })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Update CG permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedPermit = await CgPermit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'CG permit updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Delete CG permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await CgPermit.findByIdAndDelete(id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'CG permit deleted successfully',
      data: deletedPermit
    })
  } catch (error) {
    console.error('Error deleting CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Update permit status
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.status = status
    if (notes) {
      permit.notes = notes
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'CG permit status updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating CG permit status:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Add renewal entry to permit
exports.addRenewal = async (req, res) => {
  try {
    const { id } = req.params
    const { date, amount, status } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.renewalHistory.push({
      date,
      amount,
      status: status || 'Completed'
    })

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Renewal added successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error adding renewal:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Update tax details
exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params
    const { taxPaidUpto, taxAmount } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.taxDetails = {
      taxPaidUpto: taxPaidUpto || permit.taxDetails.taxPaidUpto,
      taxAmount: taxAmount || permit.taxDetails.taxAmount
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Tax details updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating tax details:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPermits = await CgPermit.countDocuments()
    const activePermits = await CgPermit.countDocuments({ status: 'Active' })
    const expiringSoonPermits = await CgPermit.countDocuments({ status: 'Expiring Soon' })
    const pendingRenewalPermits = await CgPermit.countDocuments({ status: 'Pending Renewal' })
    const expiredPermits = await CgPermit.countDocuments({ status: 'Expired' })
    const suspendedPermits = await CgPermit.countDocuments({ status: 'Suspended' })

    // Pending payment count and amount
    const pendingPaymentRecords = await CgPermit.find({ balance: { $gt: 0 } })
    const pendingPaymentCount = pendingPaymentRecords.length
    const pendingPaymentAmount = pendingPaymentRecords.reduce((sum, record) => sum + (record.balance || 0), 0)

    // Total fees collected
    const totalRevenue = await CgPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$totalFee' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: activePermits,
          expiringSoon: expiringSoonPermits,
          pendingRenewal: pendingRenewalPermits,
          expired: expiredPermits,
          suspended: suspendedPermits
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        },
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Helper function to parse date from string (DD-MM-YYYY or DD/MM/YYYY format)
function parsePermitDate(dateString) {
  if (!dateString) return null

  // Handle both DD-MM-YYYY and DD/MM/YYYY formats
  const parts = dateString.split(/[-/]/)
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed in JS
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}

// Get expiring permits (within specified days) - with pagination
exports.getExpiringPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      days = 30
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all permits
    const allPermits = await CgPermit.find()

    // Filter permits where permit is expiring in next N days
    const expiringPermits = allPermits.filter(permit => {
      const validToDate = parsePermitDate(permit.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Between 0 and specified days (not expired yet)
      return diffDays >= 0 && diffDays <= parseInt(days)
    })

    // Sort by expiry date (earliest first)
    expiringPermits.sort((a, b) => {
      const dateA = parsePermitDate(a.validTo)
      const dateB = parsePermitDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringPermits.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedPermits = expiringPermits.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPermits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expiring permits:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Share permit via WhatsApp
exports.sharePermit = async (req, res) => {
  try {
    const { id } = req.params
    const { phoneNumber } = req.body

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        errors: ['Phone number is required'],
        errorCount: 1
      })
    }

    // Get permit details
    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    // Generate WhatsApp message
    const message = generatePermitMessage(permit)

    // Format phone number for WhatsApp (add country code if not present)
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

    res.status(200).json({
      success: true,
      message: 'WhatsApp share link generated successfully',
      data: {
        whatsappUrl,
        phoneNumber: formattedPhone,
        permitNumber: permit.permitNumber
      }
    })
  } catch (error) {
    console.error('Error sharing CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Helper function to generate permit message
function generatePermitMessage(permit) {
  return `
*CG PERMIT BILL*
━━━━━━━━━━━━━━━━━━━━

*Permit Details:*
📋 Permit Number: ${permit.permitNumber}
📝 Permit Type: ${permit.permitType}
👤 Permit Holder: ${permit.permitHolder}
🚛 Vehicle Number: ${permit.vehicleNumber}

*Validity:*
📅 Valid From: ${permit.validFrom}
📅 Valid To: ${permit.validTo}
⏱️ Validity Period: ${permit.validityPeriod} years

*Fees:*
💰 Amount Paid: ₹${permit.fees}

━━━━━━━━━━━━━━━━━━━━
*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

// Generate or regenerate bill PDF for a permit
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await CgPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    let customBill = permit.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      customBill = new CustomBill({
        billNumber,
        customerName: permit.permitHolder,
        billDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        items: [
          {
            description: `CG Permit\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}\nRoute: Chhattisgarh State`,
            quantity: 1,
            rate: permit.totalFee,
            amount: permit.totalFee
          }
        ],
        totalAmount: permit.totalFee
      })
      await customBill.save()

      permit.bill = customBill._id
      await permit.save()
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

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Download bill PDF
exports.downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await CgPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    // Check if bill exists
    if (!permit.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found. Please generate it first.'
      })
    }

    // Check if PDF exists
    if (!permit.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', permit.bill.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${permit.bill.billNumber}_${permit.permitNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading bill PDF:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
    const userError = getUserFriendlyError(error)

    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}
