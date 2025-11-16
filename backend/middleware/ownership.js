// Middleware to check resource ownership
const checkOwnership = (Model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id
    const userId = req.user.id

    const resource = await Model.findById(resourceId)

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }

    // Check if the resource belongs to the logged-in user
    if (resource.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource.'
      })
    }

    // Attach resource to request for use in controller
    req.resource = resource
    next()
  } catch (error) {
    console.error('Ownership check error:', error)
    res.status(500).json({
      success: false,
      message: 'Error checking resource ownership'
    })
  }
}

module.exports = { checkOwnership }
