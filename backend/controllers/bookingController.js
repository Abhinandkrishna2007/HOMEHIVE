const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

// Helper to convert HH:MM string to minutes from midnight
const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Customer
exports.createBooking = async (req, res, next) => {
  try {
    const {
      provider: providerId,
      service: serviceId,
      bookingDate,
      bookingTime,
      address,
      city,
      state,
      pincode,
      notes,
      paymentMethod = 'UPI',
    } = req.body;

    // Validate customer role
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customer accounts can create bookings.' });
    }

    // 1. Validate booking date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return res.status(400).json({ success: false, message: 'Booking date cannot be in the past' });
    }

    // 2. Validate provider approval and availability
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (!provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Provider profile is not currently verified/approved.' });
    }

    if (!provider.isAvailable) {
      return res.status(400).json({ success: false, message: 'Provider is not accepting bookings right now.' });
    }

    // 3. Validate provider schedule for the day
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const bookingDayName = weekdays[selectedDate.getDay()];
    const daySchedule = provider.availability[bookingDayName];

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Provider is not available on ${bookingDayName.toUpperCase()}`,
      });
    }

    // Compare times
    let bookingStartStr = bookingTime;
    if (bookingTime.includes('-')) {
      bookingStartStr = bookingTime.split('-')[0].trim();
    }

    const startMins = toMinutes(bookingStartStr);
    const scheduleStartMins = toMinutes(daySchedule.startTime);
    const scheduleEndMins = toMinutes(daySchedule.endTime);

    if (startMins < scheduleStartMins || startMins >= scheduleEndMins) {
      return res.status(400).json({
        success: false,
        message: `Selected slot ${bookingTime} falls outside the provider's working hours for ${bookingDayName} (${daySchedule.startTime} - ${daySchedule.endTime})`,
      });
    }

    // 4. Validate service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.provider.toString() !== providerId) {
      return res.status(400).json({ success: false, message: 'Service does not belong to the selected provider' });
    }

    // 5. Double Booking Prevention
    const overlappingBooking = await Booking.findOne({
      provider: providerId,
      bookingDate: checkDate,
      bookingTime: bookingTime,
      bookingStatus: { $nin: ['rejected', 'cancelled'] },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Provider is already booked for this time slot. Please choose another date or slot.',
      });
    }

    // 6. Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      provider: providerId,
      service: serviceId,
      category: service.category,
      bookingDate: checkDate,
      bookingTime,
      address,
      city,
      state,
      pincode,
      notes,
      price: service.price,
      paymentStatus: 'unpaid',
      bookingStatus: 'pending',
    });

    // Create notification for provider
    await Notification.create({
      user: provider.user,
      type: 'NewBookingRequest',
      title: 'New Service Request',
      message: `You have received a new booking request for ${service.title} on ${selectedDate.toDateString()} at ${bookingTime}.`,
      booking: booking._id,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings (Customer, Provider, or Admin)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    // Role specific filtering
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: req.user.id });
      if (!provider) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      filter.provider = provider._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Tab filtering status
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        filter.bookingStatus = { $in: ['pending', 'accepted', 'confirmed', 'on-the-way', 'in-progress'] };
        filter.bookingDate = { $gte: new Date().setHours(0,0,0,0) };
      } else {
        filter.bookingStatus = status;
      }
    }

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone profileImage')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone profileImage' },
      })
      .populate('service', 'title price priceType image duration')
      .sort({ bookingDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking detail
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone profileImage')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone profileImage' },
      })
      .populate('service', 'title price priceType image duration description');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization checks
    let isAuthorized = false;
    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user.role === 'customer' && booking.customer._id.toString() === req.user.id) {
      isAuthorized = true;
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: req.user.id });
      if (provider && booking.provider._id.toString() === provider._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Accept, Reject, Timeline status)
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth validation: must be either Admin or the assigned Provider
    const provider = await Provider.findOne({ user: req.user.id });
    const isOwner = provider && booking.provider.toString() === provider._id.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update status of this booking' });
    }

    // Verify valid status transitions
    const validStatuses = ['pending', 'accepted', 'rejected', 'confirmed', 'on-the-way', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status value' });
    }

    booking.bookingStatus = status;

    // Auto-update payment status on completion
    if (status === 'completed') {
      booking.paymentStatus = 'paid';
      // Increment job counts for provider
      await Provider.findByIdAndUpdate(booking.provider, { $inc: { totalJobs: 1 } });
    }

    await booking.save();

    // Create customer notification automatically
    let notificationTitle = 'Booking Status Updated';
    let notificationMsg = `Your booking for service has changed status to ${status}.`;

    if (status === 'accepted') {
      notificationTitle = 'Service Request Accepted';
      notificationMsg = `The provider has accepted your service request for ${booking.bookingDate.toDateString()} at ${booking.bookingTime}.`;
    } else if (status === 'rejected') {
      notificationTitle = 'Service Request Declined';
      notificationMsg = `The provider has declined your service request. Please explore other professionals.`;
    } else if (status === 'confirmed') {
      notificationTitle = 'Booking Confirmed';
      notificationMsg = `Your booking is confirmed! Payment method set is ${booking.paymentStatus}.`;
    } else if (status === 'on-the-way') {
      notificationTitle = 'Provider On The Way';
      notificationMsg = `Your service technician is on the way to your address.`;
    } else if (status === 'in-progress') {
      notificationTitle = 'Service Started';
      notificationMsg = `Your home service has successfully started.`;
    } else if (status === 'completed') {
      notificationTitle = 'Service Completed';
      notificationMsg = `Service completed successfully! Please take a moment to rate and review your experience.`;
    }

    await Notification.create({
      user: booking.customer,
      type: 'BookingStatusUpdate',
      title: notificationTitle,
      message: notificationMsg,
      booking: booking._id,
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking (Customer or Provider)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check: must be either customer, provider, or admin
    let isAuthorized = false;
    let cancelledBy = '';

    if (req.user.role === 'admin') {
      isAuthorized = true;
      cancelledBy = 'Admin';
    } else if (req.user.role === 'customer' && booking.customer.toString() === req.user.id) {
      isAuthorized = true;
      cancelledBy = 'Customer';
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: req.user.id });
      if (provider && booking.provider.toString() === provider._id.toString()) {
        isAuthorized = true;
        cancelledBy = 'Provider';
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Can only cancel pending/accepted/confirmed bookings
    if (['completed', 'cancelled', 'rejected'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    // Create notifications for the other party
    if (cancelledBy === 'Customer') {
      const providerProfile = await Provider.findById(booking.provider);
      if (providerProfile) {
        await Notification.create({
          user: providerProfile.user,
          type: 'BookingCancelled',
          title: 'Booking Cancelled By Customer',
          message: `The booking for service scheduled on ${booking.bookingDate.toDateString()} at ${booking.bookingTime} was cancelled by the customer.`,
          booking: booking._id,
        });
      }
    } else {
      await Notification.create({
        user: booking.customer,
        type: 'BookingCancelled',
        title: 'Booking Cancelled By Provider',
        message: `We regret to inform you that your booking scheduled on ${booking.bookingDate.toDateString()} at ${booking.bookingTime} was cancelled by the provider.`,
        booking: booking._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
