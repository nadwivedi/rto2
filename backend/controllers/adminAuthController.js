const Admin = require('../models/Admin')
const jwt = require('jsonwebtoken')

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      })
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      })
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    })
  }
}

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password')

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      })
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      })
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Get admin profile error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}

// Admin logout
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}
