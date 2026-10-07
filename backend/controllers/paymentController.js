const PaymentMethod = require('../models/PaymentMethod');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

// @desc    Get transaction history
// @route   GET /api/payments
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      // Find provider ID
      const Provider = require('../models/Provider');
      const providerProfile = await Provider.findOne({ user: req.user.id });
      if (!providerProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      filter.provider = providerProfile._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const transactions = await Transaction.find(filter)
      .populate('customer', 'name email profileImage')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email profileImage' },
      })
      .populate({
        path: 'booking',
        populate: { path: 'service', select: 'title' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved payment methods
// @route   GET /api/payments/methods
// @access  Private
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: methods.length, data: methods });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a payment method (Card / UPI) with security guards
// @route   POST /api/payments/methods
// @access  Private
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, provider, cardNumber, upiId, isDefault } = req.body;

    if (!type || !provider) {
      return res.status(400).json({ success: false, message: 'Payment method type and provider are required.' });
    }

    let last4 = '';
    let maskedIdentifier = '';
    let tokenReference = '';

    if (type === 'card') {
      if (!cardNumber || cardNumber.length < 12) {
        return res.status(400).json({ success: false, message: 'Please provide a valid credit/debit card number.' });
      }
      // ONLY store last 4 digits
      last4 = cardNumber.slice(-4);
      maskedIdentifier = `•••• ${last4}`;
      // Simulate gateway tokenization reference
      tokenReference = `tok_cc_${provider.toLowerCase().replace(/\s+/g, '')}_${Math.random().toString(36).substr(2, 9)}`;

      // Double security check - verify req.body is cleared
      delete req.body.cardNumber;
      delete req.body.cvv;
      delete req.body.password;
    } else if (type === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        return res.status(400).json({ success: false, message: 'Please provide a valid UPI handle.' });
      }
      maskedIdentifier = upiId;
      tokenReference = `tok_upi_${provider.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;
      
      delete req.body.password;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment method type. Choose card or upi.' });
    }

    if (isDefault) {
      await PaymentMethod.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const count = await PaymentMethod.countDocuments({ user: req.user.id });
    const makeDefault = count === 0 ? true : !!isDefault;

    const paymentMethod = await PaymentMethod.create({
      user: req.user.id,
      type,
      provider,
      last4,
      maskedIdentifier,
      tokenReference,
      isDefault: makeDefault,
    });

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} method saved successfully`,
      data: paymentMethod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment method
// @route   DELETE /api/payments/methods/:id
// @access  Private
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);

    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    if (method.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this payment method' });
    }

    const wasDefault = method.isDefault;
    await PaymentMethod.findByIdAndDelete(req.params.id);

    if (wasDefault) {
      const another = await PaymentMethod.findOne({ user: req.user.id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    res.status(200).json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate booking payment success / create Transaction entry
// @route   POST /api/payments/checkout
// @access  Private
exports.processCheckout = async (req, res, next) => {
  try {
    const { bookingId, paymentMethodId, customMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let finalPaymentMethod = customMethod || 'UPI';
    if (paymentMethodId) {
      const method = await PaymentMethod.findById(paymentMethodId);
      if (method && method.user.toString() === req.user.id) {
        finalPaymentMethod = `${method.provider} (${method.maskedIdentifier})`;
      }
    }

    const isCash = finalPaymentMethod.toLowerCase().includes('cash');

    // Update booking status
    booking.paymentStatus = isCash ? 'pending' : 'paid';
    booking.bookingStatus = 'confirmed'; // confirm booking on checkout success
    await booking.save();

    // Create Transaction log
    const transaction = await Transaction.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      amount: booking.price,
      currency: 'INR',
      paymentMethod: finalPaymentMethod,
      gateway: isCash ? 'None (Cash Collection)' : 'Razorpay (Mock)',
      gatewayTransactionId: isCash ? `cash_${Math.random().toString(36).substr(2, 14)}` : `pay_${Math.random().toString(36).substr(2, 14)}`,
      status: isCash ? 'pending' : 'paid',
    });

    booking.transaction = transaction._id;
    await booking.save();

    // Send notifications to provider and customer
    const Notification = require('../models/Notification');
    const Provider = require('../models/Provider');

    // customer notify
    await Notification.create({
      user: booking.customer,
      type: 'PaymentReceived',
      title: isCash ? 'Booking Confirmed (Cash on Service)' : 'Payment Successful',
      message: isCash
        ? `Your service booking has been confirmed. Please pay ₹${booking.price} in cash to the provider upon completion.`
        : `Your payment of ₹${booking.price} for booking is successful. Status updated to confirmed.`,
      booking: booking._id,
    });

    // provider notify
    const providerProfile = await Provider.findById(booking.provider);
    if (providerProfile) {
      await Notification.create({
        user: providerProfile.user,
        type: 'PaymentReceived',
        title: 'Booking Confirmed (Paid)',
        message: `Booking has been confirmed and paid. Total amount: ₹${booking.price}.`,
        booking: booking._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment mock processed successfully. Booking confirmed.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};
