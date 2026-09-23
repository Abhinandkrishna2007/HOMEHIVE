const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  processCheckout,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect); // Require auth for all payment endpoints

router.get('/', getTransactions);
router.post('/checkout', processCheckout);

router.route('/methods')
  .get(getPaymentMethods)
  .post(addPaymentMethod);

router.delete('/methods/:id', deletePaymentMethod);

module.exports = router;
