const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  addService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getServices);
router.get('/:id', getService);

// Protected routes (Only providers or admin can perform writes)
router.post('/', protect, authorize('provider', 'admin'), addService);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
