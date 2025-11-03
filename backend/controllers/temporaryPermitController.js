const TemporaryPermit = require('../models/TemporaryPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// Create new temporary permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new temporary permit without bill reference first
    const newPermit = new TemporaryPermit(permitData)
    await newPermit.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const vehicleTypeFull = newPermit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'
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
          description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}\nPeriod: ${newPermit.validityPeriod} months`,
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
        console.log('Bill PDF generated successfully for temporary permit:', newPermit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the permit creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Temporary permit created successfully. Bill is being generated in background.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating temporary permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create temporary permit',
      error: error.message
    })
  }
}

// Get all temporary permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      vehicleType,
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

    // Filter by status
    if (status) {
      query.status = status
    }

    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType.toUpperCase()
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await TemporaryPermit.countDocuments(query)

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
    console.error('Error fetching temporary permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permits',
      error: error.message
    })
  }
}

// Get single temporary permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching temporary permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit',
      error: error.message
    })
  }
}

// Get temporary permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await TemporaryPermit.findOne({ permitNumber })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching temporary permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit',
      error: error.message
    })
  }
}

// Update temporary permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedPermit = await TemporaryPermit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Temporary permit updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating temporary permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update temporary permit',
      error: error.message
    })
  }
}

// Delete temporary permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await TemporaryPermit.findByIdAndDelete(id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Temporary permit deleted successfully',
      data: deletedPermit
    })
  } catch (error) {
    console.error('Error deleting temporary permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete temporary permit',
      error: error.message
    })
  }
}

// Update permit status
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    permit.status = status
    if (notes) {
      permit.notes = notes
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Temporary permit status updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating temporary permit status:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update temporary permit status',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPermits = await TemporaryPermit.countDocuments()
    const activePermits = await TemporaryPermit.countDocuments({ status: 'Active' })
    const expiringSoonPermits = await TemporaryPermit.countDocuments({ status: 'Expiring Soon' })
    const expiredPermits = await TemporaryPermit.countDocuments({ status: 'Expired' })
    const cancelledPermits = await TemporaryPermit.countDocuments({ status: 'Cancelled' })

    // Count by vehicle type
    const cvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'CV' })
    const pvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'PV' })

    // Total fees collected
    const totalRevenue = await TemporaryPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$totalFee' }, paid: { $sum: '$paid' }, balance: { $sum: '$balance' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: activePermits,
          expiringSoon: expiringSoonPermits,
          expired: expiredPermits,
          cancelled: cancelledPermits
        },
        vehicleTypes: {
          cv: cvPermits,
          pv: pvPermits
        },
        revenue: {
          totalFee: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          paid: totalRevenue.length > 0 ? totalRevenue[0].paid : 0,
          balance: totalRevenue.length > 0 ? totalRevenue[0].balance : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    })
  }
}

// Get expiring permits (within specified days)
exports.getExpiringPermits = async (req, res) => {
  try {
    const { days = 7 } = req.query

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + parseInt(days))

    const expiringPermits = await TemporaryPermit.find({
      status: { $in: ['Active', 'Expiring Soon'] }
    })

    // Filter permits that are expiring within the specified days
    const filteredPermits = expiringPermits.filter(permit => {
      const validToDate = new Date(permit.validTo)
      return validToDate >= today && validToDate <= futureDate
    })

    res.status(200).json({
      success: true,
      data: filteredPermits,
      count: filteredPermits.length
    })
  } catch (error) {
    console.error('Error fetching expiring permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring permits',
      error: error.message
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
        message: 'Phone number is required'
      })
    }

    // Get permit details
    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
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
    console.error('Error sharing temporary permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to share temporary permit',
      error: error.message
    })
  }
}

// Helper function to generate permit message
function generatePermitMessage(permit) {
  const vehicleTypeFull = permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'

  return `
*TEMPORARY PERMIT BILL*


*Permit Details:*
=� Permit Number: ${permit.permitNumber}
=d Permit Holder: ${permit.permitHolder}
=� Vehicle Number: ${permit.vehicleNumber}

*Vehicle Type:*
=� ${vehicleTypeFull} (${permit.vehicleType})

*Validity:*
=� Valid From: ${permit.validFrom}
=� Valid To: ${permit.validTo}
� Validity Period: ${permit.validityPeriod} months

*Purpose:*
=� ${permit.purpose || 'Temporary Use'}

*Fees:*
� Total Fee: ₹${permit.totalFee}
� Paid: ₹${permit.paid}
� Balance: ₹${permit.balance}


*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

// Generate or regenerate bill PDF for a permit
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    let customBill = permit.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      const vehicleTypeFull = permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'
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
            description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}\nPeriod: ${permit.validityPeriod} months`,
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

    const permit = await TemporaryPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
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
    res.status(500).json({
      success: false,
      message: 'Failed to download bill PDF',
      error: error.message
    })
  }
}
