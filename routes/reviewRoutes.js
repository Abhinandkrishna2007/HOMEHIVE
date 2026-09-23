const express = require('express');
const router = express.Router();
const {
  submitReview,
  getProviderReviews,
  getCustomerReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public
router.get('/provider/:providerId', getProviderReviews);

// Protected
router.post('/', protect, submitReview);
router.get('/customer', protect, getCustomerReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
