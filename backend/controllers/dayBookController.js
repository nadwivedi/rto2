const mongoose = require('mongoose')
const VehicleRegistration = require('../models/VehicleRegistration')
const Party = require('../models/Party')
const TemporaryPermit = require('../models/TemporaryPermit')
const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const Tax = require('../models/Tax')
const Fitness = require('../models/Fitness')
const Puc = require('../models/Puc')
const Gps = require('../models/Gps')
const Insurance = require('../models/Insurance')
const NationalPermit = require('../models/NationalPermit')
const CgPermit = require('../models/CgPermit')
const BusPermit = require('../models/BusPermit')
const VehicleTransfer = require('../models/vehicleTransfer')
const RegistrationRenewal = require('../models/registrationRenewal')
const CustomBill = require('../models/CustomBill')
const Noc = require('../models/Noc')

const IST_OFFSET_MINUTES = 330
const DAY_IN_MS = 24 * 60 * 60 * 1000

const dayBookSources = [
  {
    type: 'Manage Vehicle',
    model: VehicleRegistration,
    mapRecord: (record) => ({
      title: record.registrationNumber || record.chassisNumber || 'Vehicle Registration',
      subtitle: record.ownerName || record.mobileNumber || 'Vehicle registration created',
      meta: record.chassisNumber ? `Chassis: ${record.chassisNumber}` : 'Vehicle registration'
    })
  },
  {
    type: 'Manage Party',
    model: Party,
    mapRecord: (record) => ({
      title: record.partyName || 'Party',
      subtitle: record.mobile || record.address || 'Party created',
      meta: record.address || 'Party record'
    })
  },
  {
    type: 'Add NP',
    model: NationalPermit,
    mapRecord: (record) => ({
      title: record.vehicleNumber || record.permitNumber || 'National Permit',
      subtitle: record.permitNumber || record.mobileNumber || 'National permit created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'National permit'
    })
  },
  {
    type: 'Add CG Permit',
    model: CgPermit,
    mapRecord: (record) => ({
      title: record.vehicleNumber || record.permitNumber || 'CG Permit',
      subtitle: record.permitNumber || record.mobileNumber || 'CG permit created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'CG permit'
    })
  },
  {
    type: 'Bus Permit',
    model: BusPermit,
    mapRecord: (record) => ({
      title: record.vehicleNumber || record.permitNumber || 'Bus Permit',
      subtitle: record.permitNumber || record.mobileNumber || 'Bus permit created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Bus permit'
    })
  },
  {
    type: 'Add Temp Permit',
    model: TemporaryPermit,
    mapRecord: (record) => ({
      title: record.vehicleNumber || record.permitNumber || 'Temporary Permit',
      subtitle: record.permitHolder || record.mobileNumber || 'Temporary permit created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Temporary permit'
    })
  },
  {
    type: 'Temp Permit Other State',
    model: TemporaryPermitOtherState,
    mapRecord: (record) => ({
      title: record.vehicleNo || record.permitNumber || 'Temporary Permit Other State',
      subtitle: record.permitHolder || record.mobileNo || 'Other state permit created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Temporary permit other state'
    })
  },
  {
    type: 'Add Tax',
    model: Tax,
    mapRecord: (record) => ({
      title: record.vehicleNumber || record.receiptNo || 'Tax',
      subtitle: record.ownerName || record.mobileNumber || 'Tax record created',
      meta: record.taxTo ? `Tax to: ${record.taxTo}` : 'Tax record'
    })
  },
  {
    type: 'Add Fitness',
    model: Fitness,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'Fitness',
      subtitle: record.ownerName || record.mobileNumber || 'Fitness record created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Fitness record'
    })
  },
  {
    type: 'PUC',
    model: Puc,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'PUC',
      subtitle: record.ownerName || record.mobileNumber || 'PUC record created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'PUC record'
    })
  },
  {
    type: 'Add GPS',
    model: Gps,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'GPS',
      subtitle: record.ownerName || record.mobileNumber || 'GPS record created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'GPS record'
    })
  },
  {
    type: 'Insurance',
    model: Insurance,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'Insurance',
      subtitle: record.ownerName || record.mobileNumber || 'Insurance record created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Insurance record'
    })
  },
  {
    type: 'Bill',
    model: CustomBill,
    mapRecord: (record) => ({
      title: record.billNumber ? `Bill #${record.billNumber}` : 'Custom Bill',
      subtitle: record.customerName || 'Bill created',
      meta: typeof record.totalAmount === 'number' ? `Amount: ${record.totalAmount}` : 'Bill record'
    })
  },
  {
    type: 'Transfer',
    model: VehicleTransfer,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'Vehicle Transfer',
      subtitle: record.newOwnerName || record.currentOwnerName || 'Vehicle transfer created',
      meta: record.transferDate ? `Transfer date: ${record.transferDate}` : 'Vehicle transfer'
    })
  },
  {
    type: 'Registration Renewal',
    model: RegistrationRenewal,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'Registration Renewal',
      subtitle: record.ownerName || record.ownerMobile || 'Registration renewal created',
      meta: record.validTo ? `Valid to: ${record.validTo}` : 'Registration renewal'
    })
  },
  {
    type: 'NOC',
    model: Noc,
    mapRecord: (record) => ({
      title: record.vehicleNumber || 'NOC',
      subtitle: record.ownerName || record.mobileNumber || 'NOC created',
      meta: record.address || 'NOC record'
    })
  }
]

function getIstDateParts(date) {
  const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000)

  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    day: istDate.getUTCDate(),
    hours: String(istDate.getUTCHours()).padStart(2, '0'),
    minutes: String(istDate.getUTCMinutes()).padStart(2, '0')
  }
}

function getIstDayStart(offsetDays) {
  const now = new Date()
  const currentIst = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000)
  const istMidnightUtc = Date.UTC(
    currentIst.getUTCFullYear(),
    currentIst.getUTCMonth(),
    currentIst.getUTCDate() - offsetDays,
    0,
    0,
    0,
    0
  )

  return new Date(istMidnightUtc - IST_OFFSET_MINUTES * 60 * 1000)
}

function formatDateKey(date) {
  const { year, month, day } = getIstDateParts(date)
  return `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`
}

function formatTime(date) {
  const { hours, minutes } = getIstDateParts(date)
  return `${hours}:${minutes}`
}

exports.getDayBook = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 7, 1), 31)

    const newestDayStart = getIstDayStart(offset)
    const oldestDayStart = getIstDayStart(offset + limit - 1)
    const rangeStart = oldestDayStart
    const rangeEnd = new Date(newestDayStart.getTime() + DAY_IN_MS)

    const [recordsBySource, oldestRecords] = await Promise.all([
      Promise.all(
        dayBookSources.map((source) =>
          source.model.find({
            userId,
            createdAt: { $gte: rangeStart, $lt: rangeEnd }
          }).sort({ createdAt: -1 }).lean()
        )
      ),
      Promise.all(
        dayBookSources.map((source) =>
          source.model.findOne({ userId }).sort({ createdAt: 1 }).select({ createdAt: 1 }).lean()
        )
      )
    ])

    const dayMap = new Map()

    for (let i = 0; i < limit; i += 1) {
      const dayStart = getIstDayStart(offset + i)
      dayMap.set(formatDateKey(dayStart), [])
    }

    recordsBySource.forEach((records, sourceIndex) => {
      const source = dayBookSources[sourceIndex]

      records.forEach((record) => {
        const createdAt = new Date(record.createdAt)
        const dayKey = formatDateKey(createdAt)

        if (!dayMap.has(dayKey)) {
          return
        }

        const normalized = source.mapRecord(record)

        dayMap.get(dayKey).push({
          id: `${source.type}-${record._id}`,
          type: source.type,
          title: normalized.title,
          subtitle: normalized.subtitle,
          meta: normalized.meta,
          time: formatTime(createdAt),
          createdAt
        })
      })
    })

    const days = Array.from(dayMap.entries()).map(([date, items]) => ({
      date,
      totalItems: items.length,
      items: items
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(({ createdAt, ...item }) => item)
    }))

    const oldestCreatedAt = oldestRecords
      .filter(Boolean)
      .map((record) => new Date(record.createdAt))
      .sort((a, b) => a - b)[0]

    const hasMore = Boolean(oldestCreatedAt && oldestCreatedAt < oldestDayStart)

    res.json({
      success: true,
      data: {
        days,
        pagination: {
          offset,
          limit,
          nextOffset: offset + limit,
          hasMore
        }
      }
    })
  } catch (error) {
    console.error('Error fetching day book data:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching day book data',
      error: error.message
    })
  }
}
