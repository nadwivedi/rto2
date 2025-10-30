const NationalPermit = require('../models/NationalPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// Create new national permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new national permit without bill reference first
    const newPermit = new NationalPermit(permitData)
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
          description: `National Permit (Part A)\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}\nRoute: All India`,
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
        console.log('Bill PDF generated successfully for permit:', newPermit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the permit creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'National permit created successfully. Bill is being generated in background.',
      data: newPermit
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

// Get all national permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      route,
      dateFilter, // New parameter: 'Expiring30Days', 'Expiring60Days', or 'Expired'
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

    // Filter by route
    if (route) {
      query.route = route
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query to get all permits (we'll filter by date in JS)
    let permits = await NationalPermit.find(query)
      .sort(sortOptions)

    // Apply date filtering if specified
    if (dateFilter) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to start of day

      permits = permits.filter(permit => {
        const validToDate = parsePermitDate(permit.validTo)
        if (!validToDate) return false

        // Calculate difference in days
        const diffTime = validToDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case 'Expiring30Days':
            // Permits expiring within next 30 days (but not expired yet)
            return diffDays >= 0 && diffDays <= 30

          case 'Expiring60Days':
            // Permits expiring within next 60 days (but not expired yet)
            return diffDays >= 0 && diffDays <= 60

          case 'Expired':
            // Permits that have already expired
            return diffDays < 0

          default:
            return true
        }
      })
    }

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

// Get single national permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permit',
      error: error.message
    })
  }
}

// Get national permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await NationalPermit.findOne({ permitNumber })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permit',
      error: error.message
    })
  }
}

// Update national permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedPermit = await NationalPermit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Permit updated successfully',
      data: updatedPermit
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

// Delete national permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await NationalPermit.findByIdAndDelete(id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Permit deleted successfully',
      data: deletedPermit
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

// Update permit status
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    permit.status = status
    if (notes) {
      permit.notes = notes
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Permit status updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating permit status:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update permit status',
      error: error.message
    })
  }
}

// Add renewal entry to permit
exports.addRenewal = async (req, res) => {
  try {
    const { id } = req.params
    const { date, amount, status } = req.body

    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
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
    res.status(400).json({
      success: false,
      message: 'Failed to add renewal',
      error: error.message
    })
  }
}

// Update insurance details
exports.updateInsurance = async (req, res) => {
  try {
    const { id } = req.params
    const { policyNumber, company, validUpto } = req.body

    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    permit.insuranceDetails = {
      policyNumber: policyNumber || permit.insuranceDetails.policyNumber,
      company: company || permit.insuranceDetails.company,
      validUpto: validUpto || permit.insuranceDetails.validUpto
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Insurance details updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating insurance:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update insurance details',
      error: error.message
    })
  }
}

// Update tax details
exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params
    const { taxPaidUpto, taxAmount } = req.body

    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
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
    res.status(400).json({
      success: false,
      message: 'Failed to update tax details',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPermits = await NationalPermit.countDocuments()
    const activePermits = await NationalPermit.countDocuments({ status: 'Active' })
    const expiringSoonPermits = await NationalPermit.countDocuments({ status: 'Expiring Soon' })
    const pendingRenewalPermits = await NationalPermit.countDocuments({ status: 'Pending Renewal' })
    const expiredPermits = await NationalPermit.countDocuments({ status: 'Expired' })
    const suspendedPermits = await NationalPermit.countDocuments({ status: 'Suspended' })

    // Count by route type
    const allIndiaPermits = await NationalPermit.countDocuments({ route: 'All India' })
    const statePermits = await NationalPermit.countDocuments({ route: 'State' })
    const regionalPermits = await NationalPermit.countDocuments({ route: 'Regional' })

    // Total fees collected
    const totalRevenue = await NationalPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$fees' } } }
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
        routes: {
          allIndia: allIndiaPermits,
          state: statePermits,
          regional: regionalPermits
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0
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
    const { days = 30 } = req.query

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + parseInt(days))

    // This is a simplified query - you might want to adjust based on your date format
    const expiringPermits = await NationalPermit.find({
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
    const permit = await NationalPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
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
    console.error('Error sharing permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to share permit',
      error: error.message
    })
  }
}

// Helper function to generate permit message
function generatePermitMessage(permit) {
  return `
*NATIONAL PERMIT BILL*
━━━━━━━━━━━━━━━━━━━━

*Permit Details:*
📋 Permit Number: ${permit.permitNumber}
👤 Permit Holder: ${permit.permitHolder}
🚛 Vehicle Number: ${permit.vehicleNumber || 'N/A'}

*Part A Validity:*
📅 Valid From: ${permit.validFrom}
📅 Valid To: ${permit.validTo}

*Type B Authorization:*
🔐 Authorization No: ${permit.typeBAuthorization?.authorizationNumber || 'N/A'}
📅 Valid From: ${permit.typeBAuthorization?.validFrom || 'N/A'}
📅 Valid To: ${permit.typeBAuthorization?.validTo || 'N/A'}

*Fees:*
💰 Total Fee: ₹${permit.totalFee}
💵 Paid: ₹${permit.paid}
💳 Balance: ₹${permit.balance}

━━━━━━━━━━━━━━━━━━━━
*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

// Add demo data (15 national permits)
exports.addDemoData = async (req, res) => {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await NationalPermit.deleteMany({})

    const demoData = [
      {
        permitNumber: 'NP2024001234',
        permitHolder: 'Rajesh Transport Services',
        fatherName: 'Vijay Kumar',
        address: '123, Transport Nagar, Mumbai, Maharashtra - 400001',
        mobileNumber: '9876543210',
        email: 'rajesh.transport@gmail.com',
        vehicleNumber: 'MH-12-AB-1234',
        validFrom: '15-01-2024',
        validTo: '14-01-2029',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024001',
          validFrom: '15-01-2024',
          validTo: '14-01-2025'
        },
        totalFee: 15000, paid: 15000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001235',
        permitHolder: 'Kumar Logistics Pvt Ltd',
        fatherName: 'Ramesh Kumar',
        address: '456, Industrial Area, Delhi - 110001',
        mobileNumber: '9876543211',
        email: 'kumar.logistics@gmail.com',
        vehicleNumber: 'DL-1C-CD-5678',
        validFrom: '10-02-2024',
        validTo: '09-02-2029',
        issueDate: '10-02-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024002',
          validFrom: '10-02-2024',
          validTo: '09-02-2025'
        },
        totalFee: 12000, paid: 12000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001236',
        permitHolder: 'Singh Brothers Transport',
        fatherName: 'Gurpreet Singh',
        address: '789, Transport Hub, Ludhiana, Punjab - 141001',
        mobileNumber: '9876543212',
        email: 'singh.transport@gmail.com',
        vehicleNumber: 'PB-10-EF-9012',
        validFrom: '05-03-2024',
        validTo: '04-03-2029',
        issueDate: '05-03-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024003',
          validFrom: '05-03-2024',
          validTo: '04-03-2025'
        },
        totalFee: 18000, paid: 18000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001237',
        permitHolder: 'Maharashtra Freight Services',
        fatherName: 'Suresh Patil',
        address: '321, Cargo Complex, Pune, Maharashtra - 411001',
        mobileNumber: '9876543213',
        email: 'maharashtra.freight@gmail.com',
        vehicleNumber: 'MH-14-GH-3456',
        validFrom: '20-11-2024',
        validTo: '19-11-2029',
        issueDate: '20-11-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024004',
          validFrom: '20-11-2024',
          validTo: '19-11-2025'
        },
        totalFee: 14000, paid: 14000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001238',
        permitHolder: 'Gujarat Transport Corporation',
        fatherName: 'Ramesh Desai',
        address: '654, Transport Plaza, Ahmedabad, Gujarat - 380001',
        mobileNumber: '9876543214',
        email: 'gujarat.transport@gmail.com',
        vehicleNumber: 'GJ-01-IJ-7890',
        validFrom: '15-12-2024',
        validTo: '14-12-2029',
        issueDate: '15-12-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024005',
          validFrom: '15-12-2024',
          validTo: '14-12-2025'
        },
        totalFee: 16500, paid: 16500, balance: 0,
        status: 'Expiring Soon'
      },
      {
        permitNumber: 'NP2024001239',
        permitHolder: 'Chennai Express Logistics',
        fatherName: 'Krishnan Iyer',
        address: '852, Anna Salai, Chennai, Tamil Nadu - 600002',
        mobileNumber: '9876543215',
        email: 'chennai.express@gmail.com',
        vehicleNumber: 'TN-01-KL-2345',
        validFrom: '01-04-2024',
        validTo: '31-03-2029',
        issueDate: '01-04-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024006',
          validFrom: '01-04-2024',
          validTo: '31-03-2025'
        },
        totalFee: 13000, paid: 13000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001240',
        permitHolder: 'Kolkata Cargo Movers',
        fatherName: 'Arun Das',
        address: '963, Salt Lake, Kolkata, West Bengal - 700064',
        mobileNumber: '9876543216',
        email: 'kolkata.cargo@gmail.com',
        vehicleNumber: 'WB-07-MN-6789',
        validFrom: '20-05-2024',
        validTo: '19-05-2029',
        issueDate: '20-05-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024007',
          validFrom: '20-05-2024',
          validTo: '19-05-2025'
        },
        totalFee: 15500, paid: 15500, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001241',
        permitHolder: 'Hyderabad Heavy Carriers',
        fatherName: 'Venkat Reddy',
        address: '741, Secunderabad, Hyderabad, Telangana - 500003',
        mobileNumber: '9876543217',
        email: 'hyderabad.heavy@gmail.com',
        vehicleNumber: 'TS-09-OP-3456',
        validFrom: '10-06-2024',
        validTo: '09-06-2029',
        issueDate: '10-06-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024008',
          validFrom: '10-06-2024',
          validTo: '09-06-2025'
        },
        totalFee: 19000, paid: 19000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001242',
        permitHolder: 'Jaipur Road Ways',
        fatherName: 'Mahesh Sharma',
        address: '357, Mansarovar, Jaipur, Rajasthan - 302020',
        mobileNumber: '9876543218',
        email: 'jaipur.roadways@gmail.com',
        vehicleNumber: 'RJ-14-QR-7890',
        validFrom: '01-07-2024',
        validTo: '30-06-2029',
        issueDate: '01-07-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024009',
          validFrom: '01-07-2024',
          validTo: '30-06-2025'
        },
        totalFee: 16000, paid: 16000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001243',
        permitHolder: 'Bangalore Express Lines',
        fatherName: 'Prakash Reddy',
        address: '159, Whitefield, Bangalore, Karnataka - 560066',
        mobileNumber: '9876543219',
        email: 'bangalore.express@gmail.com',
        vehicleNumber: 'KA-03-ST-1234',
        validFrom: '25-07-2024',
        validTo: '24-07-2029',
        issueDate: '25-07-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024010',
          validFrom: '25-07-2024',
          validTo: '24-07-2025'
        },
        totalFee: 17500, paid: 17500, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001244',
        permitHolder: 'Lucknow Freight Movers',
        fatherName: 'Sandeep Verma',
        address: '246, Gomti Nagar, Lucknow, Uttar Pradesh - 226010',
        mobileNumber: '9876543220',
        email: 'lucknow.freight@gmail.com',
        vehicleNumber: 'UP-14-UV-5678',
        validFrom: '10-08-2024',
        validTo: '09-08-2029',
        issueDate: '10-08-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024011',
          validFrom: '10-08-2024',
          validTo: '09-08-2025'
        },
        totalFee: 14500, paid: 14500, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001245',
        permitHolder: 'Indore Transport Co',
        fatherName: 'Rajesh Jain',
        address: '753, Vijay Nagar, Indore, Madhya Pradesh - 452010',
        mobileNumber: '9876543221',
        email: 'indore.transport@gmail.com',
        vehicleNumber: 'MP-09-WX-9012',
        validFrom: '01-09-2024',
        validTo: '31-08-2029',
        issueDate: '01-09-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024012',
          validFrom: '01-09-2024',
          validTo: '31-08-2025'
        },
        totalFee: 15000, paid: 15000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001246',
        permitHolder: 'Kochi Sea Cargo Ltd',
        fatherName: 'Suresh Nair',
        address: '369, Marine Drive, Kochi, Kerala - 682031',
        mobileNumber: '9876543222',
        email: 'kochi.seacargo@gmail.com',
        vehicleNumber: 'KL-07-YZ-3456',
        validFrom: '20-09-2024',
        validTo: '19-09-2029',
        issueDate: '20-09-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024013',
          validFrom: '20-09-2024',
          validTo: '19-09-2025'
        },
        totalFee: 17000, paid: 17000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001247',
        permitHolder: 'Chandigarh Truck Lines',
        fatherName: 'Parveen Kumar',
        address: '951, Sector 17, Chandigarh - 160017',
        mobileNumber: '9876543223',
        email: 'chandigarh.truck@gmail.com',
        vehicleNumber: 'CH-01-AB-7890',
        validFrom: '05-10-2024',
        validTo: '04-10-2029',
        issueDate: '05-10-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024014',
          validFrom: '05-10-2024',
          validTo: '04-10-2025'
        },
        totalFee: 14000, paid: 14000, balance: 0,
        status: 'Active'
      },
      {
        permitNumber: 'NP2024001248',
        permitHolder: 'Nagpur Central Carriers',
        fatherName: 'Vijay Deshmukh',
        address: '135, Sitabuldi, Nagpur, Maharashtra - 440012',
        mobileNumber: '9876543224',
        email: 'nagpur.central@gmail.com',
        vehicleNumber: 'MH-31-CD-1234',
        validFrom: '25-10-2024',
        validTo: '24-10-2029',
        issueDate: '25-10-2024',
        typeBAuthorization: {
          authorizationNumber: 'NPAUTH2024015',
          validFrom: '25-10-2024',
          validTo: '24-10-2025'
        },
        fees: 13500,
        status: 'Active'
      }
    ]

    // Insert all demo data
    const insertedData = await NationalPermit.insertMany(demoData)

    res.status(201).json({
      success: true,
      message: `Successfully added ${insertedData.length} demo national permits`,
      data: insertedData,
      count: insertedData.length
    })
  } catch (error) {
    console.error('Error adding demo data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add demo data',
      error: error.message
    })
  }
}

// Get Part A (National Permit) expiring in next 30 days
exports.getPartAExpiringSoon = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all permits
    const allPermits = await NationalPermit.find()

    // Filter permits where Part A is expiring in next 30 days
    const expiringPermits = allPermits.filter(permit => {
      const validToDate = parsePermitDate(permit.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Between 0 and 30 days (not expired yet)
      return diffDays >= 0 && diffDays <= 30
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
    console.error('Error fetching Part A expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part A expiring soon',
      error: error.message
    })
  }
}

// Get Part B (Type B Authorization) expiring in next 30 days
exports.getPartBExpiringSoon = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all permits
    const allPermits = await NationalPermit.find()

    // Filter permits where Part B is expiring in next 30 days
    const expiringPermits = allPermits.filter(permit => {
      if (!permit.typeBAuthorization || !permit.typeBAuthorization.validTo) return false

      const validToDate = parsePermitDate(permit.typeBAuthorization.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Between 0 and 30 days (not expired yet)
      return diffDays >= 0 && diffDays <= 30
    })

    // Sort by expiry date (earliest first)
    expiringPermits.sort((a, b) => {
      const dateA = parsePermitDate(a.typeBAuthorization.validTo)
      const dateB = parsePermitDate(b.typeBAuthorization.validTo)
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
    console.error('Error fetching Part B expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B expiring soon',
      error: error.message
    })
  }
}

// Generate or regenerate bill PDF for a permit
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await NationalPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
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
            description: `National Permit (Part A)\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}\nRoute: All India`,
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

    const permit = await NationalPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
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

// Renew Part B Authorization
exports.renewPartB = async (req, res) => {
  try {
    const { id } = req.params
    const { authorizationNumber, validFrom, validTo, totalFee = 5000, paid = 0, balance = 5000, notes } = req.body

    // Validate required fields
    if (!authorizationNumber || authorizationNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Authorization Number is required'
      })
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    // Find permit
    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Use the provided authorization number (manual entry)
    const newAuthNumber = authorizationNumber.trim()

    // Create CustomBill for Part B renewal
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: permit.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Part B Authorization Renewal\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nAuthorization No: ${newAuthNumber}\nValid From: ${validFrom}\nValid To: ${validTo}`,
          quantity: 1,
          rate: totalFee,
          amount: totalFee
        }
      ],
      totalAmount: totalFee
    })
    await customBill.save()

    // Create renewal record with bill reference
    const renewalRecord = {
      authorizationNumber: newAuthNumber,
      renewalDate: new Date(),
      validFrom,
      validTo,
      totalFee, paid, balance,
      bill: customBill._id,
      paymentStatus: 'Paid',
      notes: notes || 'Part B renewal'
    }

    // Initialize renewal history if it doesn't exist
    if (!permit.typeBAuthorization.renewalHistory) {
      permit.typeBAuthorization.renewalHistory = []
    }

    // Note: Original Part B bill was included in main permit bill
    // No need to save original Part B to history since it shares the main permit's bill

    // Add the new renewal to history
    permit.typeBAuthorization.renewalHistory.push(renewalRecord)

    // Update current Part B dates and authorization number
    permit.typeBAuthorization.authorizationNumber = newAuthNumber
    permit.typeBAuthorization.validFrom = validFrom
    permit.typeBAuthorization.validTo = validTo

    await permit.save()

    // Generate PDF bill in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Part B renewal PDF generated successfully for permit:', permit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating Part B renewal PDF (non-critical):', pdfError)
      })

    res.status(200).json({
      success: true,
      message: 'Part B renewed successfully. Bill is being generated in background.',
      data: {
        permit,
        renewal: renewalRecord
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

// Get Part B renewal history
exports.getPartBRenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const renewalHistory = permit.typeBAuthorization?.renewalHistory || []

    res.status(200).json({
      success: true,
      data: renewalHistory,
      count: renewalHistory.length
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

// Download Part B renewal bill PDF
exports.downloadPartBRenewalPDF = async (req, res) => {
  try {
    const { id, renewalId } = req.params

    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Find the specific renewal
    const renewal = permit.typeBAuthorization.renewalHistory.id(renewalId)
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal record not found'
      })
    }

    if (!renewal.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', renewal.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${renewal.billNumber}_${permit.permitNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
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

// Get Part B expiring in next 35 days
exports.getPartBExpiringSoon = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all permits
    const allPermits = await NationalPermit.find()

    // Filter permits where Part B is expiring in next 35 days
    const expiringPermits = allPermits.filter(permit => {
      if (!permit.typeBAuthorization || !permit.typeBAuthorization.validTo) return false

      const validToDate = parsePermitDate(permit.typeBAuthorization.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Between 0 and 35 days (not expired yet)
      return diffDays >= 0 && diffDays <= 35
    })

    // Sort by expiry date (earliest first)
    expiringPermits.sort((a, b) => {
      const dateA = parsePermitDate(a.typeBAuthorization.validTo)
      const dateB = parsePermitDate(b.typeBAuthorization.validTo)
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
    console.error('Error fetching Part B expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B expiring soon',
      error: error.message
    })
  }
}


// Renew Part A (National Permit)
exports.renewPartA = async (req, res) => {
  try {
    const { id } = req.params
    const { permitNumber, validFrom, validTo, totalFee = 15000, paid = 0, balance = 15000, notes } = req.body

    // Validate required fields
    if (!permitNumber || permitNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit Number is required'
      })
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    // Find permit
    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Use the provided permit number (can be same as original or new)
    const newPermitNumber = permitNumber.trim()

    // Create CustomBill for Part A renewal
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: permit.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Part A Renewal (5 Years)\nPermit No: ${newPermitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${validFrom}\nValid To: ${validTo}\nRoute: All India`,
          quantity: 1,
          rate: totalFee,
          amount: totalFee
        }
      ],
      totalAmount: totalFee
    })
    await customBill.save()

    // Create renewal record with bill reference
    const renewalRecord = {
      permitNumber: newPermitNumber,
      renewalDate: new Date(),
      validFrom,
      validTo,
      totalFee, paid, balance,
      bill: customBill._id,
      paymentStatus: 'Paid',
      notes: notes || 'Part A renewal (5 years)'
    }

    // Initialize renewal history if it doesn't exist
    if (!permit.partARenewalHistory) {
      permit.partARenewalHistory = []
    }

    // IMPORTANT: Save the current/original Part A to history BEFORE replacing it
    // This ensures we track the original Part A that was created with the initial permit
    if (permit.permitNumber && permit.partARenewalHistory.length === 0 && permit.bill) {
      const originalPartA = {
        permitNumber: permit.permitNumber,
        renewalDate: permit.createdAt || new Date(), // Use permit creation date
        validFrom: permit.validFrom,
        validTo: permit.validTo,
        fees: permit.fees || 15000, // Original Part A fees
        bill: permit.bill, // Reference to original bill
        paymentStatus: 'Paid',
        notes: 'Original Part A (created with initial permit)',
        isOriginal: true // Flag to identify this is the original Part A
      }

      permit.partARenewalHistory.push(originalPartA)
    }

    // Add the new renewal to history
    permit.partARenewalHistory.push(renewalRecord)

    // Update current Part A dates and permit number
    permit.permitNumber = newPermitNumber
    permit.validFrom = validFrom
    permit.validTo = validTo

    await permit.save()

    // Generate PDF bill in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Part A renewal PDF generated successfully for permit:', permit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating Part A renewal PDF (non-critical):', pdfError)
      })

    res.status(200).json({
      success: true,
      message: 'Part A renewed successfully. Bill is being generated in background.',
      data: {
        permit,
        renewal: renewalRecord
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

// Get Part A renewal history
exports.getPartARenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const renewalHistory = permit.partARenewalHistory || []

    res.status(200).json({
      success: true,
      data: renewalHistory,
      count: renewalHistory.length
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

// Download Part A renewal bill PDF
exports.downloadPartARenewalPDF = async (req, res) => {
  try {
    const { id, renewalId } = req.params

    const permit = await NationalPermit.findById(id)
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Find the specific renewal
    const renewal = permit.partARenewalHistory.id(renewalId)
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal record not found'
      })
    }

    if (!renewal.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', renewal.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${renewal.billNumber}_${renewal.permitNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
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
