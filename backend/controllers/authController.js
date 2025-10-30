const Admin = require('../models/Admin')
const jwt = require('jsonwebtoken')

// Login admin
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
    const admin = await Admin.findOne({ username: username.toLowerCase() })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
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
        role: admin.role
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
}

// Verify token and get current admin
exports.verifyToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password')

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      })
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      })
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    })
  } catch (error) {
    console.error('Verify token error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Logout (client-side handles token removal, but we can track it server-side if needed)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}
