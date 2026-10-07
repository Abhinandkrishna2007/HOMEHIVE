const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites per customer
favoriteSchema.index({ customer: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
