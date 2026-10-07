const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String, // e.g. "Home", "Work", "Other"
      default: 'Home',
      trim: true,
    },
    house: {
      type: String,
      required: [true, 'Please add flat/house/building details'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please add street address'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please add area or locality'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please add pin code'],
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);
