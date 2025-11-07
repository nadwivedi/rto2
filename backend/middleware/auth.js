const jwt = require('jsonwebtoken')
const { logError, getUserFriendlyError } = require('../utils/errorLogger')

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
        errors: ['No authentication token provided'],
        errorCount: 1,
        timestamp: new Date().toISOString()
      })
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    )

    // Add admin info to request
    req.admin = decoded
    next()
  } catch (error) {
    logError(error, req) // Fire and forget

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        errors: ['Token has expired'],
        errorCount: 1,
        timestamp: new Date().toISOString()
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errors: ['Invalid token'],
        errorCount: 1,
        timestamp: new Date().toISOString()
      })
    }

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

module.exports = authMiddleware
