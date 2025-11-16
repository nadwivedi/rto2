const Driving = require('../models/Driving')
const Insurance = require('../models/Insurance')
const Tax = require('../models/Tax')
const Fitness = require('../models/Fitness')
const CgPermit = require('../models/CgPermit')
const TemporaryPermit = require('../models/TemporaryPermit')
const VehicleRegistration = require('../models/VehicleRegistration')

// Map data types to their respective models
const MODEL_MAP = {
  'driving-license': Driving,
  'insurance': Insurance,
  'tax': Tax,
  'fitness': Fitness,
  'cg-permit': CgPermit,
  'temporary-permit': TemporaryPermit,
  'vehicle-registration': VehicleRegistration
}

// Define unique field for each data type to check for duplicates
const UNIQUE_FIELD_MAP = {
  'driving-license': 'licenseNumber',
  'insurance': 'policyNumber',
  'tax': 'vehicleNumber',
  'fitness': 'vehicleNumber',
  'cg-permit': 'permitNumber',
  'national-permit': 'permitNumber',
  'temporary-permit': 'permitNumber',
  'vehicle-registration': 'vehicleNumber'
}

// Import JSON data
exports.importData = async (req, res) => {
  try {
    const { dataType, data } = req.body

    // Validate data type
    if (!dataType || !MODEL_MAP[dataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data type. Supported types: driving-license, insurance, tax, fitness, cg-permit, national-permit, temporary-permit, vehicle-registration'
      })
    }

    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of records.'
      })
    }

    const Model = MODEL_MAP[dataType]
    const uniqueField = UNIQUE_FIELD_MAP[dataType]

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      skippedRecords: []
    }

    // Process each record
    for (let i = 0; i < data.length; i++) {
      try {
        const record = { ...data[i] }

        // Check for duplicate based on unique field
        if (uniqueField && record[uniqueField]) {
          const query = {}
          query[uniqueField] = record[uniqueField]

          const existingRecord = await Model.findOne(query)

          if (existingRecord) {
            // Skip duplicate record
            results.skipped++
            results.skippedRecords.push({
              index: i,
              [uniqueField]: record[uniqueField],
              reason: `Duplicate ${uniqueField} already exists in database`
            })
            continue
          }
        }

        // Remove MongoDB-specific fields to avoid conflicts
        delete record._id
        delete record.__v
        delete record.createdAt
        delete record.updatedAt

        // Remove bill reference if present (will be created separately if needed)
        delete record.bill

        // Create new record
        const newRecord = new Model(record)
        await newRecord.save()

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          index: i,
          record: data[i],
          error: error.message
        })
      }
    }

    // Return results
    res.status(200).json({
      success: true,
      message: `Import completed. ${results.success} records imported, ${results.skipped} skipped (duplicates), ${results.failed} failed.`,
      data: results
    })
  } catch (error) {
    console.error('Error importing data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to import data',
      error: error.message
    })
  }
}

// Get supported data types
exports.getDataTypes = async (req, res) => {
  try {
    const dataTypes = [
      { value: 'driving-license', label: 'Driving License', model: 'Driving' },
      { value: 'insurance', label: 'Insurance', model: 'Insurance' },
      { value: 'tax', label: 'Tax Records', model: 'Tax' },
      { value: 'fitness', label: 'Fitness Certificates', model: 'Fitness' },
      { value: 'cg-permit', label: 'CG Permits', model: 'CgPermit' },
      { value: 'national-permit', label: 'National Permits', model: 'NationalPermit' },
      { value: 'temporary-permit', label: 'Temporary Permits', model: 'TemporaryPermit' },
      { value: 'vehicle-registration', label: 'Vehicle Registrations', model: 'VehicleRegistration' }
    ]

    res.status(200).json({
      success: true,
      data: dataTypes
    })
  } catch (error) {
    console.error('Error fetching data types:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data types',
      error: error.message
    })
  }
}

// Export sample data structure for each type
exports.getSampleStructure = async (req, res) => {
  try {
    const { dataType } = req.params

    if (!dataType || !MODEL_MAP[dataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data type'
      })
    }

    const Model = MODEL_MAP[dataType]

    // Get schema paths to create sample structure
    const sampleStructure = {}
    const schema = Model.schema.paths

    for (const key in schema) {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        const type = schema[key].instance

        if (type === 'String') {
          sampleStructure[key] = 'example string'
        } else if (type === 'Number') {
          sampleStructure[key] = 0
        } else if (type === 'Date') {
          sampleStructure[key] = new Date().toISOString()
        } else if (type === 'Boolean') {
          sampleStructure[key] = false
        } else if (type === 'Array') {
          sampleStructure[key] = []
        } else if (type === 'ObjectID') {
          sampleStructure[key] = null
        } else {
          sampleStructure[key] = null
        }
      }
    }

    res.status(200).json({
      success: true,
      data: [sampleStructure] // Return as array since import expects array
    })
  } catch (error) {
    console.error('Error fetching sample structure:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sample structure',
      error: error.message
    })
  }
}

// Validate JSON data before import
exports.validateData = async (req, res) => {
  try {
    const { dataType, data } = req.body

    // Validate data type
    if (!dataType || !MODEL_MAP[dataType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data type'
      })
    }

    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of records.'
      })
    }

    const Model = MODEL_MAP[dataType]
    const validationResults = {
      total: data.length,
      valid: 0,
      invalid: 0,
      errors: []
    }

    // Validate each record without saving
    for (let i = 0; i < data.length; i++) {
      try {
        const record = data[i]
        delete record._id // Remove _id if present

        const newRecord = new Model(record)
        const error = newRecord.validateSync()

        if (error) {
          validationResults.invalid++
          validationResults.errors.push({
            index: i,
            record: data[i],
            error: error.message
          })
        } else {
          validationResults.valid++
        }
      } catch (error) {
        validationResults.invalid++
        validationResults.errors.push({
          index: i,
          record: data[i],
          error: error.message
        })
      }
    }

    res.status(200).json({
      success: true,
      message: `Validation completed. ${validationResults.valid} valid, ${validationResults.invalid} invalid.`,
      data: validationResults
    })
  } catch (error) {
    console.error('Error validating data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to validate data',
      error: error.message
    })
  }
}
