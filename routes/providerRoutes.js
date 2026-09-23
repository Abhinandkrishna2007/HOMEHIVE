const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  approveProvider,
  rejectProvider,
  updateStatus,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProviders);
router.get('/:id', getProvider);

// Protected routes
router.post('/', protect, createProvider);
router.put('/:id', protect, updateProvider);
router.delete('/:id', protect, deleteProvider);
router.put('/:id/status', protect, updateStatus);

// Admin-only routes
router.put('/:id/approve', protect, authorize('admin'), approveProvider);
router.put('/:id/reject', protect, authorize('admin'), rejectProvider);

module.exports = router;
