const Fitness = require('../models/Fitness');
const Puc = require('../models/Puc');
const Gps = require('../models/Gps');
const Tax = require('../models/Tax');
const BusPermit = require('../models/BusPermit');
const NationalPermit = require('../models/NationalPermit');
const mongoose = require('mongoose');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Helper function to parse DD-MM-YYYY to Date
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('-');
      return new Date(year, month - 1, day);
    };

    // Get current date and calculate threshold dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    const [
      fitnessStats,
      fitnessAll,
      pucStats,
      pucAll,
      gpsStats,
      gpsAll,
      taxStats,
      taxAll,
      busPermitStats,
      busPermitAll,
      nationalPermitStats,
      nationalPermitExpiring
    ] = await Promise.all([
      // Fitness
      Fitness.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Fitness.find({ userId }).sort({ validTo: 1 }),

      // PUC
      Puc.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Puc.find({ userId }).sort({ validTo: 1 }),

      // GPS
      Gps.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Gps.find({ userId }).sort({ validTo: 1 }),

      // Tax
      Tax.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Tax.find({ userId }).sort({ taxTo: 1 }),

      // Bus Permit
      BusPermit.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      BusPermit.find({ userId }).sort({ permitExpiryDate: 1 }),

      // National Permit (dummy data for now as logic is more complex)
      Promise.resolve({ total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 }),
      Promise.resolve([]),
    ]);

    // Filter expiring records based on actual dates
    const fitnessExpiring = fitnessAll.filter(record => {
      const expiryDate = parseDate(record.validTo);
      return expiryDate && expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).slice(0, 50);

    const pucExpiring = pucAll.filter(record => {
      const expiryDate = parseDate(record.validTo);
      return expiryDate && expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).slice(0, 50);

    const gpsExpiring = gpsAll.filter(record => {
      const expiryDate = parseDate(record.validTo);
      return expiryDate && expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).slice(0, 50);

    const taxExpiring = taxAll.filter(record => {
      const expiryDate = parseDate(record.taxTo);
      return expiryDate && expiryDate >= today && expiryDate <= fifteenDaysFromNow;
    }).slice(0, 50);

    const busPermitExpiring = busPermitAll.filter(record => {
      const expiryDate = parseDate(record.permitExpiryDate);
      return expiryDate && expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).slice(0, 50);

    const formatStats = (stats, expiringCount) => {
      const result = { total: 0, active: 0, expiringSoon: 0, expired: 0 };
      let total = 0;
      stats.forEach(s => {
        if(s._id === 'active') result.active = s.count;
        if(s._id === 'expiring_soon') result.expiringSoon = s.count;
        if(s._id === 'expired') result.expired = s.count;
        total += s.count;
      });
      result.total = total;
      // Override expiringSoon with actual calculated count
      if (expiringCount !== undefined) {
        result.expiringSoon = expiringCount;
      }
      return result;
    };

    res.json({
      success: true,
      data: {
        statistics: {
          fitness: formatStats(fitnessStats, fitnessExpiring.length),
          puc: formatStats(pucStats, pucExpiring.length),
          gps: formatStats(gpsStats, gpsExpiring.length),
          tax: { ...formatStats(taxStats, taxExpiring.length), expiring: taxExpiring.length },
          busPermit: formatStats(busPermitStats, busPermitExpiring.length),
          nationalPermit: nationalPermitStats,
        },
        expiringRecords: {
          fitness: fitnessExpiring,
          puc: pucExpiring,
          gps: gpsExpiring,
          tax: taxExpiring,
          busPermit: busPermitExpiring,
          nationalPermit: nationalPermitExpiring,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};
