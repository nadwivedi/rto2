const { exec } = require('child_process')
const path = require('path')

console.log('🚀 Starting dummy data generation for all modules...\n')

const scripts = [
  { name: 'Fitness', file: 'generateFitnessDummy.js' },
  { name: 'Tax', file: 'generateTaxDummy.js' },
  { name: 'Insurance', file: 'generateInsuranceDummy.js' },
  { name: 'CG Permit', file: 'generateCgPermitDummy.js' },
  { name: 'Temporary Permit', file: 'generateTemporaryPermitDummy.js' }
]

// Run scripts sequentially
const runScript = (script, index) => {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📦 [${index + 1}/${scripts.length}] Generating ${script.name} Dummy Data`)
    console.log('='.repeat(60))

    const scriptPath = path.join(__dirname, script.file)

    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error running ${script.name} script:`, error)
        reject(error)
        return
      }

      if (stderr) {
        console.error(`⚠️  ${script.name} stderr:`, stderr)
      }

      console.log(stdout)
      resolve()
    })
  })
}

// Run all scripts
const runAllScripts = async () => {
  try {
    for (let i = 0; i < scripts.length; i++) {
      await runScript(scripts[i], i)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ ALL DUMMY DATA GENERATED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log('\n📊 Summary:')
    console.log('   ✅ Fitness: 30 records')
    console.log('   ✅ Tax: 30 records')
    console.log('   ✅ Insurance: 30 records')
    console.log('   ✅ CG Permit: 30 records')
    console.log('   ✅ Temporary Permit: 30 records')
    console.log('   📦 Total: 150 records\n')

  } catch (error) {
    console.error('\n❌ Failed to generate all dummy data')
    process.exit(1)
  }
}

runAllScripts()
