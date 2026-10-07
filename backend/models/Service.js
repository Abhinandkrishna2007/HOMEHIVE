const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a service title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a service description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'starting'],
      default: 'fixed',
    },
    duration: {
      type: String, // e.g. "1 hr", "2 hrs"
      default: '1 hr',
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ category: 1 });
serviceSchema.index({ provider: 1 });

module.exports = mongoose.model('Service', serviceSchema);
