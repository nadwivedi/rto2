const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Helper function to validate mobile number
const isValidMobile = (mobile) => {
  return /^[0-9]{10}$/.test(mobile)
}

// Helper function to validate email
const isValidEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

// Login user (using email or mobile + password)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or mobile number and password'
      })
    }

    // Validate password length
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Find user by email or mobile
    let user
    const trimmedIdentifier = identifier.trim()

    // Check if identifier is an email or mobile number
    if (trimmedIdentifier.includes('@')) {
      // Validate email format
      if (!isValidEmail(trimmedIdentifier)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        })
      }
      user = await User.findOne({ email: trimmedIdentifier.toLowerCase() })
    } else {
      // Validate mobile format
      if (!isValidMobile(trimmedIdentifier)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number'
        })
      }
      user = await User.findOne({ mobile: trimmedIdentifier })
    }


    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        type: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '30d' }
    )

    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          lastLogin: user.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    })
  }
}

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile'
    })
  }
}

// Logout user
exports.logout = async (req, res) => {
  // Clear the authentication cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}
