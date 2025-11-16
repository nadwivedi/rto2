const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

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

// Create new national permit (Part A + Part B together with combined bill)
exports.createPermit = async (req, res) => {
  try {
    const {
      vehicleNumber,
      permitNumber,
      permitHolder,
      fatherName,
      address,
      mobileNumber,
      email,
      partAValidFrom,
      partAValidTo,
      partBNumber,
      partBValidFrom,
      partBValidTo,
      totalFee,
      paid,
      balance,
      partAImage,
      partBImage,
      notes
    } = req.body

    // Validate required fields
    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      })
    }

    if (!permitNumber) {
      return res.status(400).json({
        success: false,
        message: 'Permit number is required'
      })
    }

    if (!permitHolder) {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name is required'
      })
    }

    if (!partAValidFrom || !partAValidTo) {
      return res.status(400).json({
        success: false,
        message: 'Part A valid from and valid to dates are required'
      })
    }

    if (!partBNumber) {
      return res.status(400).json({
        success: false,
        message: 'Part B number is required'
      })
    }

    if (!partBValidFrom || !partBValidTo) {
      return res.status(400).json({
        success: false,
        message: 'Part B valid from and valid to dates are required'
      })
    }

    // Validate payment fields
    if (totalFee === undefined || totalFee === null || paid === undefined || paid === null || balance === undefined || balance === null) {
      return res.status(400).json({
        success: false,
        message: 'Total fee, paid amount, and balance are required'
      })
    }

    // Validate that paid amount can't be greater than total fee
    if (paid > totalFee) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be greater than total fee'
      })
    }

    // Validate that balance amount can't be negative
    if (balance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance amount cannot be negative'
      })
    }

    // Create CustomBill document (one combined bill for Part A + Part B)
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `National Permit (Part A + Part B)\nPermit No: ${permitNumber}\nPart B No: ${partBNumber}\nVehicle No: ${vehicleNumber}\nPart A Valid: ${partAValidFrom} to ${partAValidTo}\nPart B Valid: ${partBValidFrom} to ${partBValidTo}`,
          quantity: 1,
          rate: totalFee,
          amount: totalFee
        }
      ],
      totalAmount: totalFee,
      userId: req.user.id
    })
    await customBill.save()

    // Create Part A with bill reference
    const newPartA = new NationalPermitPartA({
      vehicleNumber,
      permitNumber,
      permitHolder,
      fatherName,
      address,
      mobileNumber,
      email,
      validFrom: partAValidFrom,
      validTo: partAValidTo,
      totalFee,
      paid,
      balance,
      bill: customBill._id,
      documents: {
        partAImage: partAImage || ''
      },
      notes: notes || '',
      userId: req.user.id
    })
    await newPartA.save()

    // Create Part B WITHOUT bill reference (created with Part A)
    const newPartB = new NationalPermitPartB({
      vehicleNumber,
      permitNumber,
      partBNumber,
      permitHolder,
      validFrom: partBValidFrom,
      validTo: partBValidTo,
      documents: {
        partBImage: partBImage || ''
      },
      userId: req.user.id
      // No totalFee, paid, balance, bill - created with Part A
    })
    await newPartB.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for permit:', permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'National permit created successfully. Bill is being generated in background.',
      data: {
        partA: newPartA,
        partB: newPartB,
        bill: customBill
      }
    })
  } catch (error) {
    console.error('Error creating permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create permit',
      error: error.message
    })
  }
}

// Get all national permits (returns combined Part A and Part B data)
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      dateFilter,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = { userId: req.user.id }

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
        query.balance = { $gt: 0 }
      } else {
        query.status = status
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query to get all Part A records
    let partARecords = await NationalPermitPartA.find(query)
      .populate('bill')
      .sort(sortOptions)

    // Apply date filtering if specified
    if (dateFilter) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      partARecords = partARecords.filter(partA => {
        const validToDate = parsePermitDate(partA.validTo)
        if (!validToDate) return false

        const diffTime = validToDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case 'Expiring30Days':
            return diffDays >= 0 && diffDays <= 30
          case 'Expiring60Days':
            return diffDays >= 0 && diffDays <= 60
          case 'Expired':
            return diffDays < 0
          default:
            return true
        }
      })
    }

    // For each Part A, get the active Part B
    const permits = await Promise.all(
      partARecords.map(async (partA) => {
        const activePartB = await NationalPermitPartB.findOne({
          userId: req.user.id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          status: 'active'
        })
        .sort({ createdAt: -1 })
        .populate('bill')

        return {
          _id: partA._id,
          partA: partA,
          partB: activePartB,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          permitHolder: partA.permitHolder,
          createdAt: partA.createdAt
        }
      })
    )

    // Apply pagination after filtering
    const total = permits.length
    const paginatedPermits = permits.slice(skip, skip + parseInt(limit))

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
    console.error('Error fetching permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits',
      error: error.message
    })
  }
}

// Export all national permits without pagination (for data export functionality)
exports.exportAllPermits = async (req, res) => {
  try {
    // Execute query to get all Part A records without pagination
    const partARecords = await NationalPermitPartA.find({ userId: req.user.id })
      .populate('bill')
      .sort({ createdAt: -1 })

    // For each Part A, get the active Part B
    const permits = await Promise.all(
      partARecords.map(async (partA) => {
        const activePartB = await NationalPermitPartB.findOne({
          userId: req.user.id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          status: 'active'
        })
        .sort({ createdAt: -1 })
        .populate('bill')

        return {
          _id: partA._id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          permitHolder: partA.permitHolder,
          fatherName: partA.fatherName,
          address: partA.address,
          mobileNumber: partA.mobileNumber,
          email: partA.email,
          partAValidFrom: partA.validFrom,
          partAValidTo: partA.validTo,
          partAImage: partA.partAImage,
          partBNumber: activePartB?.number || '',
          partBValidFrom: activePartB?.validFrom || '',
          partBValidTo: activePartB?.validTo || '',
          partBImage: activePartB?.partBImage || '',
          totalFee: partA.totalFee,
          paid: partA.paid,
          balance: partA.balance,
          status: partA.status,
          notes: partA.notes,
          createdAt: partA.createdAt,
          updatedAt: partA.updatedAt
        }
      })
    )

    res.status(200).json({
      success: true,
      data: permits,
      total: permits.length
    })
  } catch (error) {
    console.error('Error exporting permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export permits',
      error: error.message
    })
  }
}

// Delete national permit (deletes all Part A and Part B records and bills)
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Permit ID is required'
      })
    }

    // Find the Part A record to get vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    // Find all Part A records
    const partARecords = await NationalPermitPartA.find({ vehicleNumber, permitNumber, userId: req.user.id }).populate('bill')

    // Find all Part B records
    const partBRecords = await NationalPermitPartB.find({ vehicleNumber, permitNumber, userId: req.user.id }).populate('bill')

    // Collect all bill IDs to delete
    const billIdsToDelete = []

    // Delete Part A bills and PDFs
    for (const partA of partARecords) {
      if (partA.bill) {
        billIdsToDelete.push(partA.bill._id)

        // Delete PDF file if exists
        if (partA.bill.billPdfPath) {
          const pdfPath = path.join(__dirname, '..', partA.bill.billPdfPath)
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath)
              console.log('Deleted PDF file:', pdfPath)
            } catch (err) {
              console.error('Error deleting PDF file:', err)
            }
          }
        }
      }
    }

    // Delete Part B bills and PDFs (only renewals have bills)
    for (const partB of partBRecords) {
      if (partB.bill) {
        billIdsToDelete.push(partB.bill._id)

        // Delete PDF file if exists
        if (partB.bill.billPdfPath) {
          const pdfPath = path.join(__dirname, '..', partB.bill.billPdfPath)
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath)
              console.log('Deleted Part B PDF:', pdfPath)
            } catch (err) {
              console.error('Error deleting Part B PDF:', err)
            }
          }
        }
      }
    }

    // Delete all associated bills
    if (billIdsToDelete.length > 0) {
      await CustomBill.deleteMany({ _id: { $in: billIdsToDelete } })
      console.log(`Deleted ${billIdsToDelete.length} associated bills`)
    }

    // Delete all Part A records
    await NationalPermitPartA.deleteMany({ vehicleNumber, permitNumber, userId: req.user.id })

    // Delete all Part B records
    await NationalPermitPartB.deleteMany({ vehicleNumber, permitNumber, userId: req.user.id })

    res.status(200).json({
      success: true,
      message: 'Permit and all associated records deleted successfully',
      data: {
        permitNumber,
        vehicleNumber,
        partADeleted: partARecords.length,
        partBDeleted: partBRecords.length,
        billsDeleted: billIdsToDelete.length
      }
    })
  } catch (error) {
    console.error('Error deleting permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete permit',
      error: error.message
    })
  }
}

// Renew Part A (creates new Part A document)
exports.renewPartA = async (req, res) => {
  try {
    const { id } = req.params
    const {
      validFrom,
      validTo,
      totalFee,
      paid,
      balance,
      notes,
      partBNumber,
      partBValidFrom,
      partBValidTo
    } = req.body

    // Validate required fields
    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    if (totalFee === undefined || paid === undefined || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Total fee, paid, and balance are required'
      })
    }

    // Get the original Part A for reference
    const originalPartA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!originalPartA) {
      return res.status(404).json({
        success: false,
        message: 'Original permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = originalPartA

    // Mark old Part A as expired
    await NationalPermitPartA.updateMany(
      { vehicleNumber, permitNumber, status: 'active' },
      { status: 'expired' }
    )

    // Check if there's an active Part B
    const activePartB = await NationalPermitPartB.findOne({
      vehicleNumber,
      permitNumber,
      status: 'active'
    }).sort({ createdAt: -1 })

    let customBill
    let actualTotalFee = totalFee
    let billDescription = ''
    let newPartB = null

    if (activePartB) {
      // Scenario 1: Active Part B exists - Only renew Part A with its own bill
      console.log('Active Part B exists, creating Part A only with bill')
      billDescription = `Part A Renewal (5 Years)\nPermit No: ${permitNumber}\nVehicle No: ${vehicleNumber}\nValid From: ${validFrom}\nValid To: ${validTo}`
    } else {
      // Scenario 2: No active Part B - Create Part A + Part B with combined bill (stored in Part A only)
      console.log('No active Part B, creating Part A + Part B with combined bill')

      if (!partBNumber || !partBValidFrom || !partBValidTo) {
        return res.status(400).json({
          success: false,
          message: 'Part B details (partBNumber, partBValidFrom, partBValidTo) are required when no active Part B exists'
        })
      }

      billDescription = `National Permit Renewal (Part A + Part B)\nPermit No: ${permitNumber}\nPart B No: ${partBNumber}\nVehicle No: ${vehicleNumber}\nPart A Valid: ${validFrom} to ${validTo}\nPart B Valid: ${partBValidFrom} to ${partBValidTo}`
    }

    // Create CustomBill (always for Part A, and includes Part B if created together)
    const billNumber = await generateCustomBillNumber(CustomBill)
    customBill = new CustomBill({
      billNumber,
      customerName: originalPartA.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: billDescription,
          quantity: 1,
          rate: actualTotalFee,
          amount: actualTotalFee
        }
      ],
      totalAmount: actualTotalFee
    })
    await customBill.save()

    // Create new Part A (always has bill reference)
    const newPartA = new NationalPermitPartA({
      vehicleNumber,
      permitNumber,
      permitHolder: originalPartA.permitHolder,
      fatherName: originalPartA.fatherName,
      address: originalPartA.address,
      mobileNumber: originalPartA.mobileNumber,
      email: originalPartA.email,
      validFrom,
      validTo,
      totalFee: actualTotalFee,
      paid,
      balance,
      bill: customBill._id,
      status: 'active',
      notes: notes || 'Part A renewal'
    })
    await newPartA.save()

    // Create new Part B ONLY if no active Part B exists
    if (!activePartB) {
      // Mark old Part B as expired if exists
      await NationalPermitPartB.updateMany(
        { vehicleNumber, permitNumber, status: 'active' },
        { status: 'expired' }
      )

      newPartB = new NationalPermitPartB({
        vehicleNumber,
        permitNumber,
        partBNumber,
        permitHolder: originalPartA.permitHolder,
        validFrom: partBValidFrom,
        validTo: partBValidTo,
        status: 'active'
        // No totalFee, paid, balance, bill - created with Part A, bill is in Part A only
      })
      await newPartB.save()
    }

    // Generate PDF in background
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Part A renewal PDF generated successfully')
      })
      .catch(pdfError => {
        console.error('Error generating Part A renewal PDF (non-critical):', pdfError)
      })

    res.status(200).json({
      success: true,
      message: activePartB
        ? 'Part A renewed successfully. Active Part B continues.'
        : 'Part A renewed successfully with new Part B. Bill is being generated in background.',
      data: {
        partA: newPartA,
        partB: newPartB || activePartB,
        bill: customBill,
        usedExistingPartB: !!activePartB
      }
    })
  } catch (error) {
    console.error('Error renewing Part A:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to renew Part A',
      error: error.message
    })
  }
}

// Renew Part B (creates new Part B document with its own bill)
exports.renewPartB = async (req, res) => {
  try {
    const { id } = req.params
    const {
      partBNumber,
      validFrom,
      validTo,
      totalFee = 5000,
      paid,
      balance,
      notes
    } = req.body

    // Validate required fields
    if (!partBNumber) {
      return res.status(400).json({
        success: false,
        message: 'Part B number is required'
      })
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    if (paid === undefined || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Paid and balance are required'
      })
    }

    // Get the original Part A for reference
    const originalPartA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!originalPartA) {
      return res.status(404).json({
        success: false,
        message: 'Original permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = originalPartA

    // Mark old Part B as expired
    await NationalPermitPartB.updateMany(
      { vehicleNumber, permitNumber, status: 'active' },
      { status: 'expired' }
    )

    // Create CustomBill for Part B renewal
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: originalPartA.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Part B Renewal\nPermit No: ${permitNumber}\nPart B No: ${partBNumber}\nVehicle No: ${vehicleNumber}\nValid From: ${validFrom}\nValid To: ${validTo}`,
          quantity: 1,
          rate: totalFee,
          amount: totalFee
        }
      ],
      totalAmount: totalFee
    })
    await customBill.save()

    // Create new Part B with bill
    const newPartB = new NationalPermitPartB({
      vehicleNumber,
      permitNumber,
      partBNumber,
      permitHolder: originalPartA.permitHolder,
      validFrom,
      validTo,
      totalFee,
      paid,
      balance,
      bill: customBill._id,
      status: 'active',
      notes: notes || 'Part B renewal'
    })
    await newPartB.save()

    // Generate PDF in background
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Part B renewal PDF generated successfully')
      })
      .catch(pdfError => {
        console.error('Error generating Part B renewal PDF (non-critical):', pdfError)
      })

    res.status(200).json({
      success: true,
      message: 'Part B renewed successfully. Bill is being generated in background.',
      data: {
        partB: newPartB,
        bill: customBill
      }
    })
  } catch (error) {
    console.error('Error renewing Part B:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to renew Part B',
      error: error.message
    })
  }
}

// Get Part A expiring soon
exports.getPartAExpiringSoon = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active Part A records
    const allPartA = await NationalPermitPartA.find({ status: 'active' })

    // Filter Part A expiring in next 30 days
    const expiringPartA = allPartA.filter(partA => {
      const validToDate = parsePermitDate(partA.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays >= 0 && diffDays <= 30
    })

    // Sort by expiry date
    expiringPartA.sort((a, b) => {
      const dateA = parsePermitDate(a.validTo)
      const dateB = parsePermitDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringPartA.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedPartA = expiringPartA.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPartA,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching Part A expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part A expiring soon',
      error: error.message
    })
  }
}

// Get Part B expiring soon
exports.getPartBExpiringSoon = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active Part B records
    const allPartB = await NationalPermitPartB.find({ status: 'active' })

    // Filter Part B expiring in next 30 days
    const expiringPartB = allPartB.filter(partB => {
      const validToDate = parsePermitDate(partB.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays >= 0 && diffDays <= 30
    })

    // Sort by expiry date
    expiringPartB.sort((a, b) => {
      const dateA = parsePermitDate(a.validTo)
      const dateB = parsePermitDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringPartB.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedPartB = expiringPartB.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPartB,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching Part B expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B expiring soon',
      error: error.message
    })
  }
}

// Get Part A renewal history
exports.getPartARenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    // Get the Part A record to find vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    const partAHistory = await NationalPermitPartA.find({
      vehicleNumber,
      permitNumber,
      userId: req.user.id
    })
    .sort({ createdAt: -1 })
    .populate('bill')

    res.status(200).json({
      success: true,
      data: partAHistory,
      count: partAHistory.length
    })
  } catch (error) {
    console.error('Error fetching Part A renewal history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part A renewal history',
      error: error.message
    })
  }
}

// Get Part B renewal history
exports.getPartBRenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    // Get the Part A record to find vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    const partBHistory = await NationalPermitPartB.find({
      vehicleNumber,
      permitNumber,
      userId: req.user.id
    })
    .sort({ createdAt: -1 })
    .populate('bill')

    res.status(200).json({
      success: true,
      data: partBHistory,
      count: partBHistory.length
    })
  } catch (error) {
    console.error('Error fetching Part B renewal history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B renewal history',
      error: error.message
    })
  }
}

// Update permit (updates Part A)
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })
    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Validate payment fields if provided
    const updatedTotalFee = updateData.totalFee !== undefined ? updateData.totalFee : partA.totalFee
    const updatedPaid = updateData.paid !== undefined ? updateData.paid : partA.paid
    const updatedBalance = updateData.balance !== undefined ? updateData.balance : partA.balance

    if (updatedPaid > updatedTotalFee) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be greater than total fee'
      })
    }

    if (updatedBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance amount cannot be negative'
      })
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        partA[key] = updateData[key]
      }
    })

    await partA.save()

    res.status(200).json({
      success: true,
      message: 'Permit updated successfully',
      data: partA
    })
  } catch (error) {
    console.error('Error updating permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update permit',
      error: error.message
    })
  }
}

// Generate bill PDF
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id }).populate('bill')

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    if (!partA.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found for this permit'
      })
    }

    // Generate PDF
    const pdfPath = await generateCustomBillPDF(partA.bill)
    partA.bill.billPdfPath = pdfPath
    await partA.bill.save()

    res.status(200).json({
      success: true,
      message: 'Bill PDF generated successfully',
      data: {
        billPdfPath: pdfPath
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

    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id }).populate('bill')

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    if (!partA.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    if (!partA.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    const pdfPath = path.join(__dirname, '..', partA.bill.billPdfPath)

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    const fileName = `${partA.bill.billNumber}_${partA.permitNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

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

// Download Part A renewal bill PDF
exports.downloadPartARenewalPDF = async (req, res) => {
  try {
    const { id, renewalId } = req.params

    const partA = await NationalPermitPartA.findOne({ _id: renewalId, userId: req.user.id }).populate('bill')

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Renewal record not found'
      })
    }

    if (!partA.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    if (!partA.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    const pdfPath = path.join(__dirname, '..', partA.bill.billPdfPath)

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    const fileName = `${partA.bill.billNumber}_PartA_Renewal.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading Part A renewal PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download Part A renewal PDF',
      error: error.message
    })
  }
}

// Download Part B renewal bill PDF
exports.downloadPartBRenewalPDF = async (req, res) => {
  try {
    const { id, renewalId } = req.params

    const partB = await NationalPermitPartB.findOne({ _id: renewalId, userId: req.user.id }).populate('bill')

    if (!partB) {
      return res.status(404).json({
        success: false,
        message: 'Renewal record not found'
      })
    }

    if (!partB.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    if (!partB.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    const pdfPath = path.join(__dirname, '..', partB.bill.billPdfPath)

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    const fileName = `${partB.bill.billNumber}_PartB_Renewal.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading Part B renewal PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download Part B renewal PDF',
      error: error.message
    })
  }
}
