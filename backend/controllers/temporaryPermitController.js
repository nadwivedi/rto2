const TemporaryPermit = require('../models/TemporaryPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// helper function to calculate status
const getTemporaryPermitStatus = (validTo) => {
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

// Create new temporary permit
exports.createPermit = async (req, res) => {
  try {
    // Destructure all fields from request body
    const {
      permitNumber,
      permitHolder,
      vehicleNumber,
      vehicleType,
      validFrom,
      validTo,
      fatherName,
      address,
      mobileNumber,
      email,
      chassisNumber,
      engineNumber,
      ladenWeight,
      unladenWeight,
      totalFee,
      paid,
      balance,
      notes
    } = req.body

    // 1. Validate required fields
    if (!permitNumber || permitNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit number is required'
      })
    }

    if (!permitHolder || permitHolder.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name is required'
      })
    }

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      })
    }

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type is required'
      })
    }

    if (!validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Valid from date is required'
      })
    }

    if (!validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid to date is required'
      })
    }

    if (totalFee === undefined || totalFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Total fee is required'
      })
    }

    // 2. Check if permit number already exists
    const existingPermit = await TemporaryPermit.findOne({ permitNumber: permitNumber.trim() })
    if (existingPermit) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // 3. Validate vehicle number format (should be 10 characters)
    const cleanVehicleNumber = vehicleNumber.trim().replace(/\s+/g, '')
    if (cleanVehicleNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number must be exactly 10 characters'
      })
    }

    // Additional validation: Vehicle number should follow pattern (e.g., CG01AB1234)
    const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
    if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number format is invalid (e.g., CG01AB1234)'
      })
    }

    // 4. Validate vehicle type
    if (!['CV', 'PV'].includes(vehicleType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be either CV or PV'
      })
    }

    // 5. Validate totalFee
    if (isNaN(totalFee) || Number(totalFee) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total fee must be greater than zero'
      })
    }

    // 6. Validate paid amount
    if (paid !== undefined && paid !== null) {
      if (isNaN(paid) || Number(paid) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be negative'
        })
      }
      if (Number(paid) > Number(totalFee)) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be greater than total fee'
        })
      }
    }

    // 7. Validate balance
    if (balance !== undefined && balance !== null) {
      if (isNaN(balance) || Number(balance) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Balance cannot be negative'
        })
      }
    }

    // 8. Validate mobile number (if provided)
    if (mobileNumber && mobileNumber.trim() !== '') {
      const cleanMobile = mobileNumber.trim().replace(/\s+/g, '')
      if (!/^[0-9]{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits'
        })
      }
    }

    // 9. Validate email format (if provided)
    if (email && email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }
    }

    // 10. Validate weight values (if provided)
    if (ladenWeight !== undefined && ladenWeight !== null) {
      if (isNaN(ladenWeight) || Number(ladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Laden weight must be a positive number'
        })
      }
    }

    if (unladenWeight !== undefined && unladenWeight !== null) {
      if (isNaN(unladenWeight) || Number(unladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Unladen weight must be a positive number'
        })
      }
    }

    // Calculate status
    const status = getTemporaryPermitStatus(validTo);

    // Prepare permit data with validated values
    const permitData = {
      permitNumber: permitNumber.trim(),
      permitHolder: permitHolder.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType.toUpperCase(),
      validFrom,
      validTo,
      totalFee: Number(totalFee),
      paid: paid !== undefined ? Number(paid) : 0,
      balance: balance !== undefined ? Number(balance) : Number(totalFee) - (paid !== undefined ? Number(paid) : 0),
      status
    }

    // Add optional fields if provided
    if (fatherName && fatherName.trim() !== '') permitData.fatherName = fatherName.trim()
    if (address && address.trim() !== '') permitData.address = address.trim()
    if (mobileNumber && mobileNumber.trim() !== '') permitData.mobileNumber = mobileNumber.trim()
    if (email && email.trim() !== '') permitData.email = email.trim().toLowerCase()
    if (chassisNumber && chassisNumber.trim() !== '') permitData.chassisNumber = chassisNumber.trim().toUpperCase()
    if (engineNumber && engineNumber.trim() !== '') permitData.engineNumber = engineNumber.trim().toUpperCase()
    if (ladenWeight !== undefined && ladenWeight !== null) permitData.ladenWeight = Number(ladenWeight)
    if (unladenWeight !== undefined && unladenWeight !== null) permitData.unladenWeight = Number(unladenWeight)
    if (notes && notes.trim() !== '') permitData.notes = notes.trim()

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
          description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}`,
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

    // Handle MongoDB duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({
        success: false,
        message: firstError
      })
    }

    // Handle all other errors
    res.status(500).json({
      success: false,
      message: 'Failed to create temporary permit'
    })
  }
}

// Get all temporary permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      vehicleType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}

    // Search by vehicle number only
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    // Filter by status or pending payment
    if (status) {
      if (status === 'pending') {
        query.balance = { $gt: 0 }
      } else {
        query.status = status
      }
    }

    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType.toUpperCase()
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await TemporaryPermit.find(query)
      .populate('bill')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
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
      message: 'Failed to fetch temporary permits'
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
      message: 'Failed to fetch temporary permit'
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
      message: 'Operation failed'
      
      
      
    })
  }
}

// Update temporary permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params

    // Destructure all fields from request body
    const {
      permitNumber,
      permitHolder,
      vehicleNumber,
      vehicleType,
      validFrom,
      validTo,
      fatherName,
      address,
      mobileNumber,
      email,
      chassisNumber,
      engineNumber,
      ladenWeight,
      unladenWeight,
      totalFee,
      paid,
      balance,
      notes
    } = req.body

    // 1. Validate required fields
    if (permitNumber && permitNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit number cannot be empty'
      })
    }

    if (permitHolder && permitHolder.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name cannot be empty'
      })
    }

    if (vehicleNumber && vehicleNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number cannot be empty'
      })
    }

    // 2. Check if permit number already exists (if being changed)
    if (permitNumber && permitNumber.trim() !== '') {
      const existingPermit = await TemporaryPermit.findOne({
        permitNumber: permitNumber.trim(),
        _id: { $ne: id } // Exclude current document
      })
      if (existingPermit) {
        return res.status(400).json({
          success: false,
          message: 'Permit number already exists'
        })
      }
    }

    // 3. Validate vehicle number format (if provided)
    if (vehicleNumber && vehicleNumber.trim() !== '') {
      const cleanVehicleNumber = vehicleNumber.trim().replace(/\s+/g, '')
      if (cleanVehicleNumber.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number must be exactly 10 characters'
        })
      }

      const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
      if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number format is invalid (e.g., CG01AB1234)'
        })
      }
    }

    // 4. Validate vehicle type (if provided)
    if (vehicleType && !['CV', 'PV'].includes(vehicleType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be either CV or PV'
      })
    }

    // 5. Validate totalFee (if provided)
    if (totalFee !== undefined && totalFee !== null) {
      if (isNaN(totalFee) || Number(totalFee) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total fee must be greater than zero'
        })
      }
    }

    // 6. Validate paid amount (if provided)
    if (paid !== undefined && paid !== null) {
      if (isNaN(paid) || Number(paid) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be negative'
        })
      }
      if (totalFee !== undefined && Number(paid) > Number(totalFee)) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be greater than total fee'
        })
      }
    }

    // 7. Validate balance (if provided)
    if (balance !== undefined && balance !== null) {
      if (isNaN(balance) || Number(balance) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Balance cannot be negative'
        })
      }
    }

    // 8. Validate mobile number (if provided)
    if (mobileNumber && mobileNumber.trim() !== '') {
      const cleanMobile = mobileNumber.trim().replace(/\s+/g, '')
      if (!/^[0-9]{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits'
        })
      }
    }

    // 9. Validate email format (if provided)
    if (email && email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }
    }

    // 10. Validate weight values (if provided)
    if (ladenWeight !== undefined && ladenWeight !== null) {
      if (isNaN(ladenWeight) || Number(ladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Laden weight must be a positive number'
        })
      }
    }

    if (unladenWeight !== undefined && unladenWeight !== null) {
      if (isNaN(unladenWeight) || Number(unladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Unladen weight must be a positive number'
        })
      }
    }

    // Prepare update data
    const updateData = {}
    if (permitNumber) updateData.permitNumber = permitNumber.trim()
    if (permitHolder) updateData.permitHolder = permitHolder.trim()
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber.trim().toUpperCase()
    if (vehicleType) updateData.vehicleType = vehicleType.toUpperCase()
    if (validFrom) updateData.validFrom = validFrom
    if (validTo) {
        updateData.validTo = validTo;
        // Recalculate status if validTo is updated
        updateData.status = getTemporaryPermitStatus(validTo);
    }
    if (totalFee !== undefined) updateData.totalFee = Number(totalFee)
    if (paid !== undefined) updateData.paid = Number(paid)
    if (balance !== undefined) updateData.balance = Number(balance)
    if (fatherName !== undefined) updateData.fatherName = fatherName ? fatherName.trim() : ''
    if (address !== undefined) updateData.address = address ? address.trim() : ''
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber ? mobileNumber.trim() : ''
    if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : ''
    if (chassisNumber !== undefined) updateData.chassisNumber = chassisNumber ? chassisNumber.trim().toUpperCase() : ''
    if (engineNumber !== undefined) updateData.engineNumber = engineNumber ? engineNumber.trim().toUpperCase() : ''
    if (ladenWeight !== undefined) updateData.ladenWeight = ladenWeight ? Number(ladenWeight) : null
    if (unladenWeight !== undefined) updateData.unladenWeight = unladenWeight ? Number(unladenWeight) : null
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : ''
    // Note: status is managed by cron job and should not be manually updated

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

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({
        success: false,
        message: firstError
      })
    }

    // Handle all other errors
    res.status(500).json({
      success: false,
      message: 'Failed to update temporary permit'
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
      message: 'Operation failed'
      
      
      
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    // Count permits by status (now using the indexed status field)
    const activePermits = await TemporaryPermit.countDocuments({ status: 'active' })
    const expiringPermits = await TemporaryPermit.countDocuments({ status: 'expiring_soon' })
    const expiredPermits = await TemporaryPermit.countDocuments({ status: 'expired' })
    const totalPermits = await TemporaryPermit.countDocuments()

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

    const pendingPaymentResults = await TemporaryPermit.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

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
          expiringSoon: expiringPermits,
          expired: expiredPermits
        },
        vehicleTypes: {
          cv: cvPermits,
          pv: pvPermits
        },
        revenue: {
          totalFee: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          paid: totalRevenue.length > 0 ? totalRevenue[0].paid : 0,
          balance: totalRevenue.length > 0 ? totalRevenue[0].balance : 0
        },
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    
    
    res.status(500).json({
      success: false,
      message: 'Operation failed'
      
      
      
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
      message: 'Operation failed'
      
      
      
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
            description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}`,
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
      message: 'Operation failed'
      
      
      
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
      message: 'Operation failed'
      
      
      
    })
  }
}
