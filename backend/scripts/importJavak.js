const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Javak = require('../models/Javak')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/rto2'
const JSON_PATH = path.join(__dirname, '..', 'javak.json')
const isDryRun = process.argv.includes('--dry-run')
const uriArg = process.argv.find((arg) => arg.startsWith('--uri='))

const normalizeDate = (value) => {
  if (!value) return ''

  const date = String(value).trim()
  const ymdMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymdMatch) return date

  const dmyMatch = date.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    return `${year}-${month}-${day}`
  }

  return date
}

const normalizeText = (value, uppercase = false) => {
  const text = value == null ? '' : String(value).trim()
  return uppercase ? text.toUpperCase() : text
}

const loadJavakEntries = () => {
  const file = fs.readFileSync(JSON_PATH, 'utf8')
  const entries = JSON.parse(file)

  if (!Array.isArray(entries)) {
    throw new Error('javak.json must contain an array of records')
  }

  return entries
}

const prepareRecord = (entry, index) => {
  const userId = normalizeText(entry.userId)
  const date = normalizeDate(entry.date)
  const partyName = normalizeText(entry.partyName, true)

  if (!userId) {
    throw new Error(`Record ${index + 1}: userId is required`)
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(`Record ${index + 1}: userId is not a valid ObjectId`)
  }

  if (!date) {
    throw new Error(`Record ${index + 1}: date is required`)
  }

  if (!partyName) {
    throw new Error(`Record ${index + 1}: partyName is required`)
  }

  return {
    userId,
    date,
    vehicleNo: normalizeText(entry.vehicleNo, true),
    partyName,
    purpose: normalizeText(entry.purpose),
    remark: normalizeText(entry.remark),
    isWorkDone: Boolean(entry.isWorkDone)
  }
}

const importJavak = async () => {
  const mongoUri = uriArg ? uriArg.slice('--uri='.length) : (process.env.MONGODB_URI || DEFAULT_MONGODB_URI)
  const records = loadJavakEntries().map(prepareRecord)

  console.log(`Loaded ${records.length} records from ${JSON_PATH}`)
  console.log(`Target database: ${mongoUri}`)

  if (isDryRun) {
    console.log('Dry run complete. No records inserted.')
    return
  }

  await mongoose.connect(mongoUri)

  const operations = records.map((record) => ({
    updateOne: {
      filter: {
        userId: record.userId,
        date: record.date,
        vehicleNo: record.vehicleNo,
        partyName: record.partyName,
        purpose: record.purpose,
        remark: record.remark
      },
      update: { $setOnInsert: record },
      upsert: true
    }
  }))

  const result = await Javak.bulkWrite(operations, { ordered: false })
  console.log(`Inserted: ${result.upsertedCount}`)
  console.log(`Already existed: ${records.length - result.upsertedCount}`)
}

importJavak()
  .catch((error) => {
    console.error('Failed to import javak.json:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
