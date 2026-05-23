const User = require('../models/User');
const Item = require('../models/Item');
const FoundItem = require('../models/FoundItem');
const ClaimRequest = require('../models/ClaimRequest');
const Report = require('../models/Report');

// @desc    Get top-level KPI dashboard metrics
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLostItems = await Item.countDocuments();
    const totalFoundItems = await FoundItem.countDocuments();
    const totalItems = totalLostItems + totalFoundItems;

    const totalClaims = await ClaimRequest.countDocuments();
    const approvedClaims = await ClaimRequest.countDocuments({ status: 'approved' });

    const activeReports = await Report.countDocuments({
      status: { $in: ['pending', 'urgent'] }
    });

    const claimSuccessRate = totalClaims > 0
      ? parseFloat(((approvedClaims / totalClaims) * 100).toFixed(2))
      : 0;

    res.json({
      totalUsers,
      totalItems,
      totalClaims,
      activeReports,
      claimSuccessRate,
      itemBreakdown: {
        lost: totalLostItems,
        found: totalFoundItems
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user growth metrics grouped by date
// @route   GET /api/admin/analytics/growth
// @access  Private/Admin
const getUserGrowthAnalytics = async (req, res) => {
  try {
    const { range = '30days' } = req.query;
    const startDate = new Date();
    let format = '%Y-%m-%d';

    if (range === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === '12months') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      format = '%Y-%m';
    } else {
      // 30days is the default
      startDate.setDate(startDate.getDate() - 30);
    }

    // Match start from midnight of start date
    startDate.setHours(0, 0, 0, 0);

    const growth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: format, date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format & Fill missing values for smooth rendering in Recharts
    const dataMap = {};
    growth.forEach(item => {
      dataMap[item._id] = item.count;
    });

    const result = [];
    const tempDate = new Date(startDate);

    if (range === '12months') {
      for (let i = 0; i < 12; i++) {
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        result.push({
          date: key,
          users: dataMap[key] || 0
        });
        tempDate.setMonth(tempDate.getMonth() + 1);
      }
    } else {
      const days = range === '7days' ? 7 : 30;
      for (let i = 0; i <= days; i++) {
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, '0');
        const day = String(tempDate.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;
        result.push({
          date: key,
          users: dataMap[key] || 0
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claim requests lifecycle distribution
// @route   GET /api/admin/analytics/claims
// @access  Private/Admin
const getClaimAnalytics = async (req, res) => {
  try {
    const claimsSummary = await ClaimRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    claimsSummary.forEach(item => {
      if (item._id && item._id in summary) {
        summary[item._id] = item.count;
        summary.total += item.count;
      }
    });

    const chartData = [
      { name: 'Pending', value: summary.pending },
      { name: 'Approved', value: summary.approved },
      { name: 'Rejected', value: summary.rejected }
    ];

    res.json({
      summary,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get moderation report flags and severity stats
// @route   GET /api/admin/analytics/moderation
// @access  Private/Admin
const getModerationAnalytics = async (req, res) => {
  try {
    const reportsSummary = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      pending: 0,
      urgent: 0,
      resolved: 0,
      rejected: 0,
      total: 0
    };

    reportsSummary.forEach(item => {
      if (item._id && item._id in summary) {
        summary[item._id] = item.count;
        summary.total += item.count;
      }
    });

    const chartData = [
      { name: 'Pending', value: summary.pending },
      { name: 'Urgent', value: summary.urgent },
      { name: 'Resolved', value: summary.resolved },
      { name: 'Rejected', value: summary.rejected }
    ];

    res.json({
      summary,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getUserGrowthAnalytics,
  getClaimAnalytics,
  getModerationAnalytics,
};
