const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminUsers,
  getAdminProviders,
  getAdminBookings,
  getAdminReviews,
  getAdminPayments,
  getAdminServices,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // Restrict all admin endpoints to Admin only

router.get('/dashboard', getDashboardStats);
router.get('/users', getAdminUsers);
router.get('/providers', getAdminProviders);
router.get('/bookings', getAdminBookings);
router.get('/reviews', getAdminReviews);
router.get('/payments', getAdminPayments);
router.get('/services', getAdminServices);

module.exports = router;
