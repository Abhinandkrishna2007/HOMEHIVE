const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String, // 'card' or 'upi'
      required: true,
    },
    provider: {
      type: String, // e.g. 'Paytm', 'HDFC Bank', 'ICICI Bank'
      required: true,
    },
    last4: {
      type: String, // e.g. '4829' or empty for UPI
      default: '',
    },
    maskedIdentifier: {
      type: String, // e.g. 'priya@paytm' or '•••• 4829'
      required: true,
    },
    tokenReference: {
      type: String, // mock tokenized representation
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

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
