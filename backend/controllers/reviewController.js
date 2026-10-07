const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc    Submit a review for a booking
// @route   POST /api/reviews
// @access  Private/Customer
exports.submitReview = async (req, res, next) => {
  try {
    const { booking: bookingId, rating, comment, tags } = req.body;

    // Validate customer role
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customer accounts can submit reviews.' });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Validate ownership
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    // Verify booking is completed
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed bookings can be reviewed.' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'This booking has already been reviewed.' });
    }

    const review = await Review.create({
      customer: req.user.id,
      provider: booking.provider,
      booking: bookingId,
      service: booking.service,
      rating,
      comment,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name profileImage')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    // Calculate rating breakdown (1 to 5 stars) dynamically
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (breakdown[rounded] !== undefined) {
        breakdown[rounded] += 1;
      }
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      breakdown,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews written by logged-in customer
// @route   GET /api/reviews/customer
// @access  Private/Customer
exports.getCustomerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customer: req.user.id })
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name profileImage' },
      })
      .populate('service', 'title price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only creator of review or Admin can delete
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const providerId = review.provider;
    await Review.findByIdAndDelete(req.params.id);

    // Re-trigger static aggregation manually after deletion
    await Review.getAverageRating(providerId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
