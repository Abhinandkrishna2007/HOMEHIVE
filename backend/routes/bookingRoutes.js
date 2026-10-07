const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes require authentication

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBooking);

router.route('/:id/status')
  .put(updateBookingStatus);

router.route('/:id/cancel')
  .put(cancelBooking);

module.exports = router;
