const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')

// helper function to calculate status
const getTemporaryPermitOtherStateStatus = (validTo) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  sevenDaysFromNow.setHours(23, 59, 59, 999);

  // a little utility function to parse dates consistently
  const parseDate = (dateString) => {
      const parts = dateString.split(/[-/]/);
      // new Date(year, monthIndex, day)
      return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const validToDate = parseDate(validTo);

  if (validToDate < today) {
    return 'expired';
  } else if (validToDate <= sevenDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};

// Create new temporary permit (other state)
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Calculate status
    const status = getTemporaryPermitOtherStateStatus(permitData.validTo);
    permitData.status = status;

    // Create new temporary permit without bill reference first
    const newPermit = new TemporaryPermitOtherState(permitData)
    await newPermit.save()

    // Create CustomBill document if there's payment
    if (newPermit.totalFee > 0) {
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
            description: `Temporary Permit (Other State)\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNo}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}`,
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
          console.log('Bill PDF generated successfully for temporary permit (other state):', newPermit.permitNumber)
        })
        .catch(pdfError => {
          console.error('Error generating PDF (non-critical):', pdfError)
        })
    }

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Temporary permit (other state) created successfully.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating temporary permit (other state):', error)
    logError(error, req)
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

// Get all temporary permits (other state)
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    let query = {}

    // Search filter
    if (search) {
      query.$or = [
        { permitNumber: { $regex: search, $options: 'i' } },
        { permitHolder: { $regex: search, $options: 'i' } },
        { vehicleNo: { $regex: search, $options: 'i' } },
        { mobileNo: { $regex: search, $options: 'i' } }
      ]
    }

    // Count total permits
    const totalPermits = await TemporaryPermitOtherState.countDocuments(query)

    // Get permits with pagination and sorting
    const sortField = sortBy || 'createdAt'
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermitOtherState.find(query)
      .sort({ [sortField]: sortDirection })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('bill')

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPermits / parseInt(limit)),
        totalRecords: totalPermits,
        totalItems: totalPermits,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching temporary permits (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permits (other state)',
      error: error.message
    })
  }
}

// Get expiring soon permits
exports.getExpiringSoonPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'asc' } = req.query

    // Find all vehicle numbers that have active permits
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActivePermits = await TemporaryPermitOtherState.find({ status: 'active' })
      .distinct('vehicleNo')

    const query = {
      status: 'expiring_soon',
      vehicleNo: { $nin: vehiclesWithActivePermits }
    }

    if (search) {
      query.$and = [
        { vehicleNo: { $nin: vehiclesWithActivePermits } },
        {
          $or: [
            { permitNumber: { $regex: search, $options: 'i' } },
            { permitHolder: { $regex: search, $options: 'i' } },
            { vehicleNo: { $regex: search, $options: 'i' } },
            { mobileNo: { $regex: search, $options: 'i' } }
          ]
        }
      ]
      delete query.vehicleNo
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermitOtherState.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bill')

    const total = await TemporaryPermitOtherState.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasMore: skip + permits.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring soon permits:', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon permits',
      error: error.message
    })
  }
}

// Get expired permits
exports.getExpiredPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'desc' } = req.query

    // Find all vehicle numbers that have active permits
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActivePermits = await TemporaryPermitOtherState.find({ status: 'active' })
      .distinct('vehicleNo')

    const query = {
      status: 'expired',
      vehicleNo: { $nin: vehiclesWithActivePermits }
    }

    if (search) {
      query.$and = [
        { vehicleNo: { $nin: vehiclesWithActivePermits } },
        {
          $or: [
            { permitNumber: { $regex: search, $options: 'i' } },
            { permitHolder: { $regex: search, $options: 'i' } },
            { vehicleNo: { $regex: search, $options: 'i' } },
            { mobileNo: { $regex: search, $options: 'i' } }
          ]
        }
      ]
      delete query.vehicleNo
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermitOtherState.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bill')

    const total = await TemporaryPermitOtherState.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasMore: skip + permits.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expired permits:', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired permits',
      error: error.message
    })
  }
}

// Get pending payment permits
exports.getPendingPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { balance: { $gt: 0 } }

    if (search) {
      query.$or = [
        { permitNumber: { $regex: search, $options: 'i' } },
        { permitHolder: { $regex: search, $options: 'i' } },
        { vehicleNo: { $regex: search, $options: 'i' } },
        { mobileNo: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermitOtherState.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bill')

    const total = await TemporaryPermitOtherState.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasMore: skip + permits.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching pending payment permits:', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payment permits',
      error: error.message
    })
  }
}

// Get single permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const permit = await TemporaryPermitOtherState.findById(req.params.id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }
    res.json({ success: true, data: permit })
  } catch (error) {
    console.error('Error fetching temporary permit (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit (other state)',
      error: error.message
    })
  }
}

// Update permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    if (updateData.validTo) {
        // Recalculate status if validTo is updated
        updateData.status = getTemporaryPermitOtherStateStatus(updateData.validTo);
    }

    const updatedPermit = await TemporaryPermitOtherState.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }

    res.json({
      success: true,
      message: 'Temporary permit (other state) updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating temporary permit (other state):', error)
    logError(error, req)
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

// Delete permit
exports.deletePermit = async (req, res) => {
  try {
    const deletedPermit = await TemporaryPermitOtherState.findByIdAndDelete(req.params.id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }

    res.json({
      success: true,
      message: 'Temporary permit (other state) deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting temporary permit (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to delete temporary permit (other state)',
      error: error.message
    })
  }
}

// Get expiring soon count
exports.getExpiringSoonCount = async (req, res) => {
  try {
    const count = await TemporaryPermitOtherState.countDocuments({ status: 'expiring_soon' });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting expiring soon count:', error);
    logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to get expiring soon count',
      error: error.message,
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    // Count permits by status (now using the indexed status field)
    const activePermits = await TemporaryPermitOtherState.countDocuments({ status: 'active' });

    // For expiring soon and expired, exclude vehicles that also have active permits (renewed vehicles)
    const vehiclesWithActivePermits = await TemporaryPermitOtherState.find({ status: 'active' })
      .distinct('vehicleNo')

    const expiringPermits = await TemporaryPermitOtherState.countDocuments({
      status: 'expiring_soon',
      vehicleNo: { $nin: vehiclesWithActivePermits }
    });

    const expiredPermits = await TemporaryPermitOtherState.countDocuments({
      status: 'expired',
      vehicleNo: { $nin: vehiclesWithActivePermits }
    });

    const total = await TemporaryPermitOtherState.countDocuments();

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { balance: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balance' },
        },
      },
    ];

    const pendingPaymentResults = await TemporaryPermitOtherState.aggregate(pendingPaymentPipeline);
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0;
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0;

    res.json({
      success: true,
      data: {
        total,
        active: activePermits,
        expired: expiredPermits,
        expiringSoon: expiringPermits,
        pendingPaymentCount,
        pendingPaymentAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching temporary permit (other state) statistics:', error);
    logError(error, req);
    const userError = getUserFriendlyError(error);
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp(),
    });
  }
};
