const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')

// Create new custom bill
exports.createCustomBill = async (req, res) => {
  try {
    const { customerName, billDate, items, totalAmount, notes } = req.body

    // Validate required fields
    if (!customerName || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, items, and total amount are required'
      })
    }

    // Create custom bill object
    const customBill = new CustomBill({
      customerName,
      billDate,
      items,
      totalAmount,
      notes
    })

    // Generate bill number
    customBill.billNumber = await generateCustomBillNumber(CustomBill)

    // Generate PDF
    const pdfPath = await generateCustomBillPDF(customBill)
    customBill.billPdfPath = pdfPath

    // Save to database
    await customBill.save()

    res.status(201).json({
      success: true,
      message: 'Custom bill created successfully',
      data: customBill
    })
  } catch (error) {
    console.error('Error creating custom bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create custom bill',
      error: error.message
    })
  }
}

// Get all custom bills
exports.getAllCustomBills = async (req, res) => {
  try {
    const customBills = await CustomBill.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: customBills.length,
      data: customBills
    })
  } catch (error) {
    console.error('Error fetching custom bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom bills',
      error: error.message
    })
  }
}

// Get custom bill by ID
exports.getCustomBillById = async (req, res) => {
  try {
    const customBill = await CustomBill.findById(req.params.id)

    if (!customBill) {
      return res.status(404).json({
        success: false,
        message: 'Custom bill not found'
      })
    }

    res.status(200).json({
      success: true,
      data: customBill
    })
  } catch (error) {
    console.error('Error fetching custom bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom bill',
      error: error.message
    })
  }
}

// Delete custom bill
exports.deleteCustomBill = async (req, res) => {
  try {
    const customBill = await CustomBill.findByIdAndDelete(req.params.id)

    if (!customBill) {
      return res.status(404).json({
        success: false,
        message: 'Custom bill not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Custom bill deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting custom bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom bill',
      error: error.message
    })
  }
}
