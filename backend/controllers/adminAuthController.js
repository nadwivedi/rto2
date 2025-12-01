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

    // Update last login (using updateOne to avoid triggering pre-save hooks)
    await Admin.updateOne({ _id: admin._id }, { lastLogin: new Date() })

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

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.json({
      success: true,
      message: 'Login successful',
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
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  })

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}
