const mongoose = require('mongoose');

const availabilityDaySchema = new mongoose.Schema({
  isAvailable: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: String,
    default: '09:00', // HH:MM 24h format
  },
  endTime: {
    type: String,
    default: '18:00', // HH:MM 24h format
  },
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  monday: { type: availabilityDaySchema, default: () => ({}) },
  tuesday: { type: availabilityDaySchema, default: () => ({}) },
  wednesday: { type: availabilityDaySchema, default: () => ({}) },
  thursday: { type: availabilityDaySchema, default: () => ({}) },
  friday: { type: availabilityDaySchema, default: () => ({}) },
  saturday: { type: availabilityDaySchema, default: () => ({}) },
  sunday: { type: availabilityDaySchema, default: () => ({ isAvailable: false }) },
}, { _id: false });

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please add a business name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a service category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description of your services'],
    },
    experience: {
      type: Number,
      required: [true, 'Please add years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a business phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please add a business email'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    serviceArea: {
      type: String,
      required: [true, 'Please add service area details'],
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    pincode: {
      type: String,
      required: [true, 'Please add pincode'],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availability: {
      type: availabilitySchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
providerSchema.index({ city: 1 });
providerSchema.index({ category: 1 });
providerSchema.index({ rating: -1 });

module.exports = mongoose.model('Provider', providerSchema);
