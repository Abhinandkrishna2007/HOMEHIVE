const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // A booking can only have one review
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
    },
    tags: [
      {
        type: String, // e.g. "On Time", "Clean Work", "Professional"
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Statics method to get average rating and save to Provider
reviewSchema.statics.getAverageRating = async function (providerId) {
  const obj = await this.aggregate([
    {
      $match: { provider: providerId },
    },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Provider').findByIdAndUpdate(providerId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews,
      });
    } else {
      await this.model('Provider').findByIdAndUpdate(providerId, {
        rating: 5.0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.provider);
});

// Call getAverageRating before remove
reviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.provider);
});

module.exports = mongoose.model('Review', reviewSchema);
