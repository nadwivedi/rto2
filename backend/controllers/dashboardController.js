const Fitness = require('../models/Fitness');
const Puc = require('../models/Puc');
const Gps = require('../models/Gps');
const Tax = require('../models/Tax');
const BusPermit = require('../models/BusPermit');
const NationalPermit = require('../models/NationalPermit');
const CgPermit = require('../models/CgPermit');
const Insurance = require('../models/Insurance');
const mongoose = require('mongoose');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [
      fitnessStats,
      fitnessExpiring,
      pucStats,
      pucExpiring,
      gpsStats,
      gpsExpiring,
      taxStats,
      taxExpiring,
      busPermitStats,
      busPermitExpiring,
      nationalPermitStats,
      nationalPermitExpiring,
      cgPermitStats,
      cgPermitExpiring,
      insuranceStats,
      insuranceExpiring,
    ] = await Promise.all([
      // Fitness
      Fitness.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Fitness.find({ userId, status: 'expiring_soon' }).sort({ validTo: 1 }),

      // PUC
      Puc.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Puc.find({ userId, status: 'expiring_soon' }).sort({ validTo: 1 }),

      // GPS
      Gps.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Gps.find({ userId, status: 'expiring_soon' }).sort({ validTo: 1 }),

      // Tax
      Tax.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Tax.find({ userId, status: 'expiring_soon' }).sort({ taxTo: 1 }),

      // Bus Permit
      BusPermit.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      BusPermit.find({ userId, status: 'expiring_soon' }).sort({ permitExpiryDate: 1 }),

      // National Permit (dummy data for now as logic is more complex)
      Promise.resolve({ total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 }),
      Promise.resolve([]),

      // CG Permit
      CgPermit.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      CgPermit.find({ userId, status: 'expiring_soon' }).sort({ permitExpiryDate: 1 }),

      // Insurance
      Insurance.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Insurance.find({ userId, status: 'expiring_soon' }).sort({ validTo: 1 }),
    ]);

    const formatStats = (stats) => {
      const result = { total: 0, active: 0, expiringSoon: 0, expired: 0 };
      let total = 0;
      stats.forEach(s => {
        if(s._id === 'active') result.active = s.count;
        if(s._id === 'expiring_soon') result.expiringSoon = s.count;
        if(s._id === 'expired') result.expired = s.count;
        total += s.count;
      });
      result.total = total;
      return result;
    };

    res.json({
      success: true,
      data: {
        statistics: {
          fitness: formatStats(fitnessStats),
          puc: formatStats(pucStats),
          gps: formatStats(gpsStats),
          tax: { ...formatStats(taxStats), expiring: formatStats(taxStats).expiringSoon },
          busPermit: formatStats(busPermitStats),
          nationalPermit: nationalPermitStats,
          cgPermit: formatStats(cgPermitStats),
          insurance: formatStats(insuranceStats),
        },
        expiringRecords: {
          fitness: fitnessExpiring,
          puc: pucExpiring,
          gps: gpsExpiring,
          tax: taxExpiring,
          busPermit: busPermitExpiring,
          nationalPermit: nationalPermitExpiring,
          cgPermit: cgPermitExpiring,
          insurance: insuranceExpiring,
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
