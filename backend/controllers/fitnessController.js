const Fitness = require('../models/Fitness')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')
const { request } = require('http')

// helper function to calculate status
const getFitnessStatus = (validTo) => {
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

  const validToDate = parseDate(validTo);

  if (validToDate < today) {
    return 'expired';
  } else if (validToDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};


// Get all fitness records
exports.getAllFitness = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = {}

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const fitnessRecords = await Fitness.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Fitness.countDocuments(query)

    res.json({
      success: true,
      data: fitnessRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + fitnessRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness records',
      error: error.message
    })
  }
}

// Get expiring soon fitness records
exports.getExpiringSoonFitness = async (req, res) => {
  try {

    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'asc' } = req.query

    // Find all vehicle numbers that have both expiring_soon and active fitness
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActiveFitness = await Fitness.find({ status: 'active' })
      .distinct('vehicleNumber')

    const query = {
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActiveFitness }
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActiveFitness } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const fitnessRecords = await Fitness.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Fitness.countDocuments(query)

    res.json({
      success: true,
      data: fitnessRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + fitnessRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring soon fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon fitness records',
      error: error.message
    })
  }
}

// Get expired fitness records
exports.getExpiredFitness = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'desc' } = req.query

    // Find all vehicle numbers that have active fitness
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActiveFitness = await Fitness.find({ status: 'active' })
      .distinct('vehicleNumber')

    const query = {
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActiveFitness }
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActiveFitness } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const fitnessRecords = await Fitness.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Fitness.countDocuments(query)

    res.json({
      success: true,
      data: fitnessRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + fitnessRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expired fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired fitness records',
      error: error.message
    })
  }
}

// Get active fitness records
exports.getActiveFitness = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'asc' } = req.query

    const query = { status: 'active' }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const fitnessRecords = await Fitness.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Fitness.countDocuments(query)

    res.json({
      success: true,
      data: fitnessRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + fitnessRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching active fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching active fitness records',
      error: error.message
    })
  }
}

// Get pending fitness records
exports.getPendingFitness = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { balance: { $gt: 0 } }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const fitnessRecords = await Fitness.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Fitness.countDocuments(query)

    res.json({
      success: true,
      data: fitnessRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + fitnessRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching pending fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending fitness records',
      error: error.message
    })
  }
}


// Get single fitness record by ID
exports.getFitnessById = async (req, res) => {
  try {
    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    res.json({
      success: true,
      data: fitness
    })
  } catch (error) {
    console.error('Error fetching fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness record',
      error: error.message
    })
  }
}

// Create new fitness record
exports.createFitness = async (req, res) => {
  try {
    const { vehicleNumber, validFrom, validTo, totalFee, paid, balance } = req.body

    // Validate required fields
    if (!vehicleNumber || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, valid from, and valid to are required'
      })
    }

    // Calculate status
    const status = getFitnessStatus(validTo);

    // Create new fitness record without bill reference first
    const fitness = new Fitness({
      vehicleNumber,
      validFrom,
      validTo,
      totalFee: totalFee || 0,
      paid: paid || 0,
      balance: balance || 0,
      status
    })

    await fitness.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: `Vehicle: ${fitness.vehicleNumber}`,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Fitness Certificate\nVehicle No: ${fitness.vehicleNumber}\nValid From: ${fitness.validFrom}\nValid To: ${fitness.validTo}`,
          quantity: 1,
          rate: fitness.totalFee,
          amount: fitness.totalFee
        }
      ],
      totalAmount: fitness.totalFee
    })
    await customBill.save()

    // Update fitness with bill reference
    fitness.bill = customBill._id
    await fitness.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for fitness:', fitness.vehicleNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the fitness creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Fitness record created successfully. Bill is being generated in background.',
      data: fitness
    })
  } catch (error) {
    console.error('Error creating fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating fitness record',
      error: error.message
    })
  }
}

// Update fitness record
exports.updateFitness = async (req, res) => {
  try {
    const { vehicleNumber, validFrom, validTo, totalFee, paid, balance } = req.body

    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    // Update fields
    if (vehicleNumber) fitness.vehicleNumber = vehicleNumber
    if (validFrom) fitness.validFrom = validFrom
    if (validTo) {
        fitness.validTo = validTo
        // Recalculate status if validTo is updated
        fitness.status = getFitnessStatus(validTo);
    }
    if (totalFee !== undefined) fitness.totalFee = totalFee
    if (paid !== undefined) fitness.paid = paid
    if (balance !== undefined) fitness.balance = balance

    await fitness.save()

    res.json({
      success: true,
      message: 'Fitness record updated successfully',
      data: fitness
    })
  } catch (error) {
    console.error('Error updating fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating fitness record',
      error: error.message
    })
  }
}

// Delete fitness record
exports.deleteFitness = async (req, res) => {
  try {
    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    await fitness.deleteOne()

    res.json({
      success: true,
      message: 'Fitness record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting fitness record',
      error: error.message
    })
  }
}

// Get fitness statistics
exports.getFitnessStatistics = async (req, res) => {
  try {
    // Count permits by status (now using the indexed status field)
    const activeFitness = await Fitness.countDocuments({ status: 'active' })

    // For expiring soon and expired, exclude vehicles that also have active fitness (renewed vehicles)
    const vehiclesWithActiveFitness = await Fitness.find({ status: 'active' })
      .distinct('vehicleNumber')

    const expiringSoonFitness = await Fitness.countDocuments({
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActiveFitness }
    })

    const expiredFitness = await Fitness.countDocuments({
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActiveFitness }
    })

    const total = await Fitness.countDocuments()

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { balance: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balance' }
        }
      }
    ]

    const pendingPaymentResults = await Fitness.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    res.json({
      success: true,
      data: {
        total,
        active: activeFitness,
        expired: expiredFitness,
        expiringSoon: expiringSoonFitness,
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching fitness statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness statistics',
      error: error.message
    })
  }
}

// Generate or regenerate bill PDF for a fitness record
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const fitness = await Fitness.findById(id).populate('bill')
    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    let customBill = fitness.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      customBill = new CustomBill({
        billNumber,
        customerName: `Vehicle: ${fitness.vehicleNumber}`,
        billDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        items: [
          {
            description: `Fitness Certificate\nVehicle No: ${fitness.vehicleNumber}\nValid From: ${fitness.validFrom}\nValid To: ${fitness.validTo}`,
            quantity: 1,
            rate: fitness.totalFee,
            amount: fitness.totalFee
          }
        ],
        totalAmount: fitness.totalFee
      })
      await customBill.save()

      fitness.bill = customBill._id
      await fitness.save()
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

    const fitness = await Fitness.findById(id).populate('bill')
    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    // Check if bill exists
    if (!fitness.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found. Please generate it first.'
      })
    }

    // Check if PDF exists
    if (!fitness.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', fitness.bill.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${fitness.bill.billNumber}_${fitness.vehicleNumber}.pdf`
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
