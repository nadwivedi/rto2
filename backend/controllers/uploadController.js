const fs = require('fs')
const path = require('path')
const { logError, getUserFriendlyError } = require('../utils/errorLogger')
const VehicleRegistration = require('../models/VehicleRegistration')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'rc-images')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Helper function to delete old RC image file
const deleteOldRCImage = (imagePath) => {
  try {
    if (!imagePath) return

    const filename = path.basename(imagePath)
    const filePath = path.join(uploadsDir, filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Deleted old RC image: ${filename}`)
    }
  } catch (error) {
    console.error('Error deleting old RC image:', error)
    // Don't throw error, just log it
  }
}

// Upload RC Image (accepts base64 JPG, JPEG, PNG, WebP)
// Only 1 image per vehicle registration - replaces old image if exists
exports.uploadRCImage = async (req, res) => {
  try {
    const { imageData, vehicleRegistrationId } = req.body

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      })
    }

    // If vehicleRegistrationId provided, check for existing image and delete it
    if (vehicleRegistrationId) {
      const existingVehicle = await VehicleRegistration.findOne({
        _id: vehicleRegistrationId,
        userId: req.user.id
      })

      if (existingVehicle && existingVehicle.rcImage) {
        // Delete old RC image file
        deleteOldRCImage(existingVehicle.rcImage)
      }
    }

    // Validate base64 format - accept multiple image formats
    const imageFormatRegex = /^data:image\/(jpeg|jpg|png|webp);base64,/
    const match = imageData.match(imageFormatRegex)

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, JPEG, PNG, and WebP formats are accepted'
      })
    }

    const imageFormat = match[1]

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Check file size (12MB limit)
    const fileSizeInMB = buffer.length / (1024 * 1024)
    if (fileSizeInMB > 12) {
      return res.status(400).json({
        success: false,
        message: `File size (${fileSizeInMB.toFixed(2)}MB) exceeds the 12MB limit`
      })
    }

    // Generate unique filename with appropriate extension
    // Only 1 image per user-vehicle, so include vehicleId if provided
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = imageFormat === 'jpeg' ? 'jpg' : imageFormat
    const filename = `rc-${req.user.id}-${timestamp}-${randomString}.${extension}`
    const filePath = path.join(uploadsDir, filename)

    // Save file to disk
    fs.writeFileSync(filePath, buffer)

    // Return the relative path
    const relativePath = `/uploads/rc-images/${filename}`

    res.status(200).json({
      success: true,
      message: 'RC image uploaded successfully (only 1 image allowed per vehicle)',
      data: {
        filename,
        path: relativePath,
        size: buffer.length,
        sizeInMB: fileSizeInMB.toFixed(2),
        format: imageFormat.toUpperCase()
      }
    })
  } catch (error) {
    logError(error, req)
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Delete RC Image
exports.deleteRCImage = async (req, res) => {
  try {
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Image path is required'
      })
    }

    // Extract filename from path
    const filename = path.basename(imagePath)
    const filePath = path.join(uploadsDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      })
    }

    // Verify file belongs to current user (filename contains userId)
    if (!filename.includes(`rc-${req.user.id}-`)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this image'
      })
    }

    // Delete file
    fs.unlinkSync(filePath)

    res.status(200).json({
      success: true,
      message: 'RC image deleted successfully'
    })
  } catch (error) {
    logError(error, req)
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}
