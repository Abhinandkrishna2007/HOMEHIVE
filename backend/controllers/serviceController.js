const Service = require('../models/Service');
const Provider = require('../models/Provider');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const filter = {};

    // If querying for a specific provider (e.g. catalog list), fetch both active and inactive.
    // Otherwise (public listing), only return active.
    if (req.query.provider) {
      filter.provider = req.query.provider;
    } else {
      filter.isActive = true;
    }

    // If filtering by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter).populate('provider');
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service details
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a service
// @route   POST /api/services
// @access  Private/Provider
exports.addService = async (req, res, next) => {
  try {
    // Find provider profile of logged in user
    const provider = await Provider.findOne({ user: req.user.id });

    if (!provider) {
      return res.status(400).json({ success: false, message: 'Only registered providers can list services.' });
    }

    if (!provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Your provider profile must be approved by an administrator before adding services.' });
    }

    const { title, description, price, priceType, duration, image } = req.body;

    const service = await Service.create({
      provider: provider._id,
      category: provider.category, // Service category matches provider specialty
      title,
      description,
      price,
      priceType,
      duration,
      image: image || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=60`,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Service added successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Provider
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Find provider profile of logged in user
    const provider = await Provider.findOne({ user: req.user.id });
    const isOwner = provider && service.provider.toString() === provider._id.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service listing' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Provider
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const provider = await Provider.findOne({ user: req.user.id });
    const isOwner = provider && service.provider.toString() === provider._id.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service listing' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};
