const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');

// @desc    Get dashboard statistics for admin panel
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await Provider.countDocuments();
    const pendingProviders = await Provider.countDocuments({ approvalStatus: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    // Live Revenue Sum
    const revenueAgg = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Average rating
    const ratingAgg = await Provider.aggregate([
      { $match: { totalReviews: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const averageRating = ratingAgg.length > 0 ? Math.round(ratingAgg[0].avg * 10) / 10 : 5.0;

    // Category distribution for charts
    const categoryDistribution = await Booking.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Monthly revenue distribution (for chart)
    const monthlyEarnings = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          earnings: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format monthly earnings for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChartData = monthlyEarnings.map((item) => ({
      name: months[item._id - 1] || 'Month',
      revenue: item.earnings,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalProviders,
          pendingProviders,
          totalBookings,
          completedBookings,
          cancelledBookings,
          revenue,
          averageRating,
        },
        categoryDistribution,
        revenueChartData: revenueChartData.length > 0 ? revenueChartData : [{ name: 'Aug', revenue }],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin table
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers for admin table
// @route   GET /api/admin/providers
// @access  Private/Admin
exports.getAdminProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find()
      .populate('user', 'name email phone profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin table
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name' },
      })
      .populate('service', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for admin table
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name email')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name' },
      })
      .populate('service', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for admin table
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAdminPayments = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('customer', 'name email')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services for admin table
// @route   GET /api/admin/services
// @access  Private/Admin
exports.getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find()
      .populate('provider')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};
