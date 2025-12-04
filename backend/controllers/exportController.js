const User = require('../models/User')
const VehicleRegistration = require('../models/VehicleRegistration')
const DrivingLicense = require('../models/Driving')
const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')
const CgPermit = require('../models/CgPermit')
const TemporaryPermit = require('../models/TemporaryPermit')
const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const Fitness = require('../models/Fitness')
const Tax = require('../models/Tax')
const Insurance = require('../models/Insurance')
const Puc = require('../models/Puc')
const VehicleTransfer = require('../models/vehicleTransfer')
const CustomBill = require('../models/CustomBill')
const archiver = require('archiver')

// Get export statistics
exports.getExportStatistics = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      vehicleRegistrations: await VehicleRegistration.countDocuments(),
      drivingLicenses: await DrivingLicense.countDocuments(),
      nationalPermitsPartA: await NationalPermitPartA.countDocuments(),
      nationalPermitsPartB: await NationalPermitPartB.countDocuments(),
      cgPermits: await CgPermit.countDocuments(),
      temporaryPermits: await TemporaryPermit.countDocuments(),
      temporaryPermitsOtherState: await TemporaryPermitOtherState.countDocuments(),
      fitness: await Fitness.countDocuments(),
      tax: await Tax.countDocuments(),
      insurance: await Insurance.countDocuments(),
      puc: await Puc.countDocuments(),
      vehicleTransfers: await VehicleTransfer.countDocuments(),
      customBills: await CustomBill.countDocuments()
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Get export statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get export statistics',
      error: error.message
    })
  }
}

// Export all data combined in one zip file
exports.exportAllDataCombined = async (req, res) => {
  try {
    // Fetch all data
    const users = await User.find({}).select('-password').lean()
    const vehicleRegistrations = await VehicleRegistration.find({}).populate('userId', 'name mobile1').lean()
    const drivingLicenses = await DrivingLicense.find({}).populate('userId', 'name mobile1').lean()
    const nationalPermitsPartA = await NationalPermitPartA.find({}).populate('userId', 'name mobile1').lean()
    const nationalPermitsPartB = await NationalPermitPartB.find({}).populate('userId', 'name mobile1').lean()
    const cgPermits = await CgPermit.find({}).populate('userId', 'name mobile1').lean()
    const temporaryPermits = await TemporaryPermit.find({}).populate('userId', 'name mobile1').lean()
    const temporaryPermitsOtherState = await TemporaryPermitOtherState.find({}).populate('userId', 'name mobile1').lean()
    const fitness = await Fitness.find({}).populate('userId', 'name mobile1').lean()
    const taxes = await Tax.find({}).populate('userId', 'name mobile1').lean()
    const insurances = await Insurance.find({}).populate('userId', 'name mobile1').lean()
    const pucs = await Puc.find({}).populate('userId', 'name mobile1').lean()
    const vehicleTransfers = await VehicleTransfer.find({}).populate('userId', 'name mobile1').lean()
    const customBills = await CustomBill.find({}).populate('userId', 'name mobile1').lean()

    // Create zip file
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    // Set response headers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename=rto_all_data_combined_${timestamp}.zip`)

    // Pipe archive to response
    archive.pipe(res)

    // Add JSON files to archive
    archive.append(JSON.stringify(users, null, 2), { name: 'users.json' })
    archive.append(JSON.stringify(vehicleRegistrations, null, 2), { name: 'vehicle_registrations.json' })
    archive.append(JSON.stringify(drivingLicenses, null, 2), { name: 'driving_licenses.json' })
    archive.append(JSON.stringify(nationalPermitsPartA, null, 2), { name: 'national_permits_part_a.json' })
    archive.append(JSON.stringify(nationalPermitsPartB, null, 2), { name: 'national_permits_part_b.json' })
    archive.append(JSON.stringify(cgPermits, null, 2), { name: 'cg_permits.json' })
    archive.append(JSON.stringify(temporaryPermits, null, 2), { name: 'temporary_permits.json' })
    archive.append(JSON.stringify(temporaryPermitsOtherState, null, 2), { name: 'temporary_permits_other_state.json' })
    archive.append(JSON.stringify(fitness, null, 2), { name: 'fitness_certificates.json' })
    archive.append(JSON.stringify(taxes, null, 2), { name: 'tax_records.json' })
    archive.append(JSON.stringify(insurances, null, 2), { name: 'insurance_records.json' })
    archive.append(JSON.stringify(pucs, null, 2), { name: 'puc_records.json' })
    archive.append(JSON.stringify(vehicleTransfers, null, 2), { name: 'vehicle_transfers.json' })
    archive.append(JSON.stringify(customBills, null, 2), { name: 'custom_bills.json' })

    // Finalize archive
    await archive.finalize()
  } catch (error) {
    console.error('Export all data combined error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export all data combined',
        error: error.message
      })
    }
  }
}

// Export all data organized by user
exports.exportAllDataUserWise = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}).select('-password').lean()

    // Create zip file
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    // Set response headers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename=rto_all_data_user_wise_${timestamp}.zip`)

    // Pipe archive to response
    archive.pipe(res)

    // Process each user
    for (const user of users) {
      const userId = user._id
      const folderName = `user_${user.mobile1}_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}`

      // Fetch all data for this user
      const vehicleRegistrations = await VehicleRegistration.find({ userId }).lean()
      const drivingLicenses = await DrivingLicense.find({ userId }).lean()
      const nationalPermitsPartA = await NationalPermitPartA.find({ userId }).lean()
      const nationalPermitsPartB = await NationalPermitPartB.find({ userId }).lean()
      const cgPermits = await CgPermit.find({ userId }).lean()
      const temporaryPermits = await TemporaryPermit.find({ userId }).lean()
      const temporaryPermitsOtherState = await TemporaryPermitOtherState.find({ userId }).lean()
      const fitness = await Fitness.find({ userId }).lean()
      const taxes = await Tax.find({ userId }).lean()
      const insurances = await Insurance.find({ userId }).lean()
      const pucs = await Puc.find({ userId }).lean()
      const vehicleTransfers = await VehicleTransfer.find({ userId }).lean()
      const customBills = await CustomBill.find({ userId }).lean()

      // Add user info file
      archive.append(JSON.stringify(user, null, 2), { name: `${folderName}/user_info.json` })

      // Add data files if they exist
      if (vehicleRegistrations.length > 0) {
        archive.append(JSON.stringify(vehicleRegistrations, null, 2), { name: `${folderName}/vehicle_registrations.json` })
      }
      if (drivingLicenses.length > 0) {
        archive.append(JSON.stringify(drivingLicenses, null, 2), { name: `${folderName}/driving_licenses.json` })
      }
      if (nationalPermitsPartA.length > 0) {
        archive.append(JSON.stringify(nationalPermitsPartA, null, 2), { name: `${folderName}/national_permits_part_a.json` })
      }
      if (nationalPermitsPartB.length > 0) {
        archive.append(JSON.stringify(nationalPermitsPartB, null, 2), { name: `${folderName}/national_permits_part_b.json` })
      }
      if (cgPermits.length > 0) {
        archive.append(JSON.stringify(cgPermits, null, 2), { name: `${folderName}/cg_permits.json` })
      }
      if (temporaryPermits.length > 0) {
        archive.append(JSON.stringify(temporaryPermits, null, 2), { name: `${folderName}/temporary_permits.json` })
      }
      if (temporaryPermitsOtherState.length > 0) {
        archive.append(JSON.stringify(temporaryPermitsOtherState, null, 2), { name: `${folderName}/temporary_permits_other_state.json` })
      }
      if (fitness.length > 0) {
        archive.append(JSON.stringify(fitness, null, 2), { name: `${folderName}/fitness_certificates.json` })
      }
      if (taxes.length > 0) {
        archive.append(JSON.stringify(taxes, null, 2), { name: `${folderName}/tax_records.json` })
      }
      if (insurances.length > 0) {
        archive.append(JSON.stringify(insurances, null, 2), { name: `${folderName}/insurance_records.json` })
      }
      if (pucs.length > 0) {
        archive.append(JSON.stringify(pucs, null, 2), { name: `${folderName}/puc_records.json` })
      }
      if (vehicleTransfers.length > 0) {
        archive.append(JSON.stringify(vehicleTransfers, null, 2), { name: `${folderName}/vehicle_transfers.json` })
      }
      if (customBills.length > 0) {
        archive.append(JSON.stringify(customBills, null, 2), { name: `${folderName}/custom_bills.json` })
      }
    }

    // Finalize archive
    await archive.finalize()
  } catch (error) {
    console.error('Export all data user-wise error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export all data user-wise',
        error: error.message
      })
    }
  }
}
