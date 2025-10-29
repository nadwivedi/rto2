const VehicleRegistration = require('../models/VehicleRegistration')
const NationalPermit = require('../models/NationalPermit')
const CgPermit = require('../models/CgPermit')
const TemporaryPermit = require('../models/TemporaryPermit')
const Insurance = require('../models/Insurance')
const Fitness = require('../models/Fitness')
const Tax = require('../models/Tax')

// Get complete vehicle profile with all permits, insurance, fitness, and tax
const getVehicleProfile = async (req, res) => {
  try {
    const { vehicleNumber } = req.params

    // Fetch vehicle registration
    const vehicle = await VehicleRegistration.findOne({
      vehicleNumber: vehicleNumber.toUpperCase()
    })

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    // Fetch all related documents in parallel for better performance
    const [nationalPermits, cgPermits, temporaryPermits, insurances, fitness, taxes] = await Promise.all([
      NationalPermit.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 }),
      CgPermit.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 }),
      TemporaryPermit.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 }),
      Insurance.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 }),
      Fitness.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 }),
      Tax.find({ vehicleNumber: vehicleNumber.toUpperCase() }).sort({ createdAt: -1 })
    ])

    // Build complete vehicle profile
    const vehicleProfile = {
      vehicle: vehicle,
      permits: {
        national: nationalPermits,
        cg: cgPermits,
        temporary: temporaryPermits
      },
      insurance: insurances,
      fitness: fitness,
      tax: taxes,
      summary: {
        totalPermits: nationalPermits.length + cgPermits.length + temporaryPermits.length,
        totalInsurancePolicies: insurances.length,
        totalFitnessRecords: fitness.length,
        totalTaxRecords: taxes.length,
        activePermits: [...nationalPermits, ...cgPermits, ...temporaryPermits].filter(p => p.status === 'Active').length,
        activeInsurance: insurances.filter(i => i.status === 'Active').length,
        activeFitness: fitness.filter(f => f.status === 'Active').length,
        activeTax: taxes.filter(t => t.status === 'Active').length
      }
    }

    res.status(200).json({
      success: true,
      data: vehicleProfile
    })

  } catch (error) {
    console.error('Error fetching vehicle profile:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle profile',
      error: error.message
    })
  }
}

// Get complete vehicle profile using virtual populate (alternative method)
const getVehicleProfileWithVirtuals = async (req, res) => {
  try {
    const { vehicleNumber } = req.params

    const vehicle = await VehicleRegistration.findOne({
      vehicleNumber: vehicleNumber.toUpperCase()
    })
    .populate('nationalPermits')
    .populate('cgPermits')
    .populate('temporaryPermits')
    .populate('insurances')
    .populate('fitness')
    .populate('taxes')

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    res.status(200).json({
      success: true,
      data: vehicle
    })

  } catch (error) {
    console.error('Error fetching vehicle profile:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle profile',
      error: error.message
    })
  }
}

// Get all expiring documents for a vehicle
const getExpiringDocuments = async (req, res) => {
  try {
    const { vehicleNumber } = req.params
    const daysAhead = parseInt(req.query.days) || 30 // Default 30 days

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    const futureDateString = futureDate.toISOString().split('T')[0]

    // Find expiring documents
    const [expiringPermits, expiringInsurance, expiringFitness, expiringTax] = await Promise.all([
      Promise.all([
        NationalPermit.find({
          vehicleNumber: vehicleNumber.toUpperCase(),
          validTo: { $lte: futureDateString },
          status: { $in: ['Active', 'Expiring Soon'] }
        }),
        CgPermit.find({
          vehicleNumber: vehicleNumber.toUpperCase(),
          validTo: { $lte: futureDateString },
          status: { $in: ['Active', 'Expiring Soon'] }
        }),
        TemporaryPermit.find({
          vehicleNumber: vehicleNumber.toUpperCase(),
          validTo: { $lte: futureDateString },
          status: { $in: ['Active', 'Expiring Soon'] }
        })
      ]),
      Insurance.find({
        vehicleNumber: vehicleNumber.toUpperCase(),
        validTo: { $lte: futureDateString },
        status: { $in: ['Active', 'Expiring Soon'] }
      }),
      Fitness.find({
        vehicleNumber: vehicleNumber.toUpperCase(),
        validTo: { $lte: futureDateString }
      }),
      Tax.find({
        vehicleNumber: vehicleNumber.toUpperCase(),
        validTo: { $lte: futureDateString },
        status: { $in: ['Active', 'Expiring Soon'] }
      })
    ])

    const allExpiringPermits = [...expiringPermits[0], ...expiringPermits[1], ...expiringPermits[2]]

    res.status(200).json({
      success: true,
      data: {
        permits: allExpiringPermits,
        insurance: expiringInsurance,
        fitness: expiringFitness,
        tax: expiringTax,
        totalExpiring: allExpiringPermits.length + expiringInsurance.length + expiringFitness.length + expiringTax.length
      }
    })

  } catch (error) {
    console.error('Error fetching expiring documents:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring documents',
      error: error.message
    })
  }
}

// Search vehicles with their complete information
const searchVehicles = async (req, res) => {
  try {
    const { search } = req.query

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const vehicles = await VehicleRegistration.find({
      $or: [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { chassisNumber: { $regex: search, $options: 'i' } }
      ]
    }).limit(20)

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    })

  } catch (error) {
    console.error('Error searching vehicles:', error)
    res.status(500).json({
      success: false,
      message: 'Error searching vehicles',
      error: error.message
    })
  }
}

module.exports = {
  getVehicleProfile,
  getVehicleProfileWithVirtuals,
  getExpiringDocuments,
  searchVehicles
}
