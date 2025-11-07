const fs = require('fs')
const path = require('path')

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Get log file path for today
const getLogFilePath = () => {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
  return path.join(logsDir, `error-log-${dateString}.txt`)
}

// Format error log entry
const formatLogEntry = (error, req = null) => {
  const timestamp = new Date().toISOString()
  const separator = '='.repeat(80)

  let logEntry = `\n${separator}\n`
  logEntry += `[${timestamp}] ERROR LOG\n`
  logEntry += `${separator}\n`

  // Request information
  if (req) {
    logEntry += `\nREQUEST DETAILS:\n`
    logEntry += `  Method: ${req.method}\n`
    logEntry += `  URL: ${req.originalUrl || req.url}\n`
    logEntry += `  IP: ${req.ip || req.connection.remoteAddress}\n`

    if (req.body && Object.keys(req.body).length > 0) {
      logEntry += `  Body: ${JSON.stringify(req.body, null, 2)}\n`
    }

    if (req.query && Object.keys(req.query).length > 0) {
      logEntry += `  Query: ${JSON.stringify(req.query, null, 2)}\n`
    }

    if (req.params && Object.keys(req.params).length > 0) {
      logEntry += `  Params: ${JSON.stringify(req.params, null, 2)}\n`
    }
  }

  // Error information
  logEntry += `\nERROR DETAILS:\n`

  if (error.name) {
    logEntry += `  Error Type: ${error.name}\n`
  }

  if (error.message) {
    logEntry += `  Message: ${error.message}\n`
  }

  if (error.code) {
    logEntry += `  Error Code: ${error.code}\n`
  }

  // MongoDB/Mongoose specific errors
  if (error.errors) {
    logEntry += `  Validation Errors:\n`
    Object.keys(error.errors).forEach(field => {
      const fieldError = error.errors[field]
      logEntry += `    - ${field}: ${fieldError.message}\n`
    })
  }

  // Duplicate key error
  if (error.code === 11000 && error.keyValue) {
    logEntry += `  Duplicate Key: ${JSON.stringify(error.keyValue)}\n`
  }

  // Stack trace
  if (error.stack) {
    logEntry += `\nSTACK TRACE:\n${error.stack}\n`
  }

  logEntry += `${separator}\n`

  return logEntry
}

// Log error to file (Fire and Forget - Non-blocking)
const logError = (error, req = null) => {
  // Run asynchronously without waiting
  setImmediate(() => {
    try {
      const logFilePath = getLogFilePath()
      const logEntry = formatLogEntry(error, req)

      // Append to log file asynchronously
      fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
        if (err) {
          console.error('Failed to write to error log:', err)
        } else {
          console.error(`Error logged to: ${logFilePath}`)
        }
      })
    } catch (loggingError) {
      console.error('Failed to write to error log:', loggingError)
    }
  })
}

// Parse MongoDB validation errors into user-friendly messages
const parseValidationErrors = (error) => {
  const errors = []

  if (error.errors) {
    Object.keys(error.errors).forEach(field => {
      const fieldError = error.errors[field]
      let message = ''

      switch (fieldError.kind) {
        case 'required':
          message = `${field} is required`
          break
        case 'unique':
          message = `${field} already exists`
          break
        case 'minlength':
          message = `${field} must be at least ${fieldError.properties.minlength} characters`
          break
        case 'maxlength':
          message = `${field} must not exceed ${fieldError.properties.maxlength} characters`
          break
        case 'min':
          message = `${field} must be at least ${fieldError.properties.min}`
          break
        case 'max':
          message = `${field} must not exceed ${fieldError.properties.max}`
          break
        case 'enum':
          message = `${field} must be one of: ${fieldError.properties.enumValues.join(', ')}`
          break
        default:
          message = fieldError.message || `${field} is invalid`
      }

      errors.push(message)
    })
  }

  return errors
}

// Parse duplicate key error
const parseDuplicateKeyError = (error) => {
  if (error.code === 11000 && error.keyValue) {
    const field = Object.keys(error.keyValue)[0]
    const value = error.keyValue[field]
    return `${field} '${value}' already exists in the database`
  }
  return 'Duplicate entry found'
}

// Get user-friendly error message
const getUserFriendlyError = (error) => {
  // Validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const validationErrors = parseValidationErrors(error)
    return {
      message: 'Validation failed',
      details: validationErrors,
      errorCount: validationErrors.length
    }
  }

  // Duplicate key error
  if (error.code === 11000) {
    return {
      message: parseDuplicateKeyError(error),
      details: [parseDuplicateKeyError(error)],
      errorCount: 1
    }
  }

  // Cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return {
      message: `Invalid ${error.path}: ${error.value}`,
      details: [`Invalid ${error.path}: ${error.value}`],
      errorCount: 1
    }
  }

  // Generic error
  return {
    message: error.message || 'An error occurred',
    details: [error.message || 'An error occurred'],
    errorCount: 1
  }
}

module.exports = {
  logError,
  parseValidationErrors,
  parseDuplicateKeyError,
  getUserFriendlyError,
  formatLogEntry
}
