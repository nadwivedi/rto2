const fs = require('fs')
const path = require('path')

const controllersDir = path.join(__dirname, '../controllers')

// Controllers to update
const controllers = [
  'authController.js',
  'customBillController.js',
  'drivingLicenseController.js',
  'fitnessController.js',
  'importController.js',
  'insuranceController.js',
  'nationalPermitController.js',
  'taxController.js',
  'temporaryPermitController.js',
  'vehicleProfileController.js',
  'vehicleRegistrationController.js'
]

const importStatement = `const { logError, getUserFriendlyError } = require('../utils/errorLogger')`

const oldErrorPattern = /catch \(error\) \{[\s\S]*?res\.status\(\d+\)\.json\(\{[\s\S]*?success: false,[\s\S]*?message: ['"][^'"]*['"],[\s\S]*?error: error\.message[\s\S]*?\}\)[\s\S]*?\}/g

const newErrorHandler = `catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }`

console.log('Starting controller updates...\n')

controllers.forEach(controllerFile => {
  const filePath = path.join(controllersDir, controllerFile)

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${controllerFile} - file not found`)
    return
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8')

    // Check if already has import
    if (!content.includes('getUserFriendlyError')) {
      // Add import after the first require statement
      const firstRequireIndex = content.indexOf('require(')
      if (firstRequireIndex !== -1) {
        const lineEnd = content.indexOf('\n', firstRequireIndex)
        content = content.slice(0, lineEnd + 1) + importStatement + '\n' + content.slice(lineEnd + 1)
      }
    }

    // Count catch blocks before
    const catchMatches = content.match(/catch \(error\)/g)
    const beforeCount = catchMatches ? catchMatches.length : 0

    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Updated ${controllerFile} (${beforeCount} catch blocks found)`)

  } catch (error) {
    console.error(`❌ Error updating ${controllerFile}:`, error.message)
  }
})

console.log('\n✨ Controller updates completed!')
console.log('\n⚠️  Note: Please manually update each catch block using this pattern:')
console.log(`
catch (error) {
  logError(error, req) // Fire and forget
  const userError = getUserFriendlyError(error)
  res.status(400).json({
    success: false,
    message: userError.message,
    errors: userError.details,
    errorCount: userError.errorCount,
    timestamp: new Date().toISOString()
  })
}
`)
