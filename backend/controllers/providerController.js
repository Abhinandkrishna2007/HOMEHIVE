const Provider = require('../models/Provider');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all providers with filters & pagination (Public Search)
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      rating,
      minExperience,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      approvalStatus: 'approved', // Only approved providers for public directory
    };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Filter by rating (greater than or equal)
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by experience (greater than or equal)
    if (minExperience) {
      query.experience = { $gte: parseInt(minExperience) };
    }

    // Search by name/description
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by price (checks if provider has any service within price range)
    if (maxPrice) {
      const matchingServices = await Service.find({
        price: { $lte: parseFloat(maxPrice) },
      }).select('provider');
      const providerIds = matchingServices.map((service) => service.provider);
      query._id = { $in: providerIds };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalResults = await Provider.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limitNum);

    const providers = await Provider.find(query)
      .populate('user', 'name email profileImage')
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1, createdAt: -1 });

    // For each provider, we can append their starting price dynamically
    const providersWithPrice = await Promise.all(
      providers.map(async (p) => {
        const services = await Service.find({ provider: p._id, isActive: true });
        const startingPrice = services.length > 0 ? Math.min(...services.map(s => s.price)) : 0;
        return {
          ...p.toObject(),
          startingPrice,
        };
      })
    );

    res.status(200).json({
      success: true,
      currentPage: pageNum,
      totalPages,
      totalResults,
      data: providersWithPrice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider profile details
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', 'name email phone profileImage');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Fetch services offered by this provider
    const services = await Service.find({ provider: provider._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...provider.toObject(),
        services,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create provider details (Normally done automatically during registration)
// @route   POST /api/providers
// @access  Private
exports.createProvider = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Check if provider profile already exists
    const existing = await Provider.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' });
    }

    const provider = await Provider.create(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider details
// @route   PUT /api/providers/:id
// @access  Private
exports.updateProvider = async (req, res, next) => {
  try {
    let provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Validate ownership (Provider user themselves or Admin)
    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Prevent direct verification status hijack through general update
    if (req.user.role !== 'admin') {
      delete req.body.isApproved;
      delete req.body.approvalStatus;
      delete req.body.rating;
      delete req.body.totalReviews;
      delete req.body.totalJobs;
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Business profile updated successfully', data: provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete provider details
// @route   DELETE /api/providers/:id
// @access  Private/Admin
exports.deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
    }

    await Provider.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Provider profile deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve provider (Admin only)
// @route   PUT /api/providers/:id/approve
// @access  Private/Admin
exports.approveProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    provider.isApproved = true;
    provider.approvalStatus = 'approved';
    await provider.save();

    res.status(200).json({ success: true, message: 'Provider profile approved successfully', data: provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject provider (Admin only)
// @route   PUT /api/providers/:id/reject
// @access  Private/Admin
exports.rejectProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    provider.isApproved = false;
    provider.approvalStatus = 'rejected';
    await provider.save();

    res.status(200).json({ success: true, message: 'Provider profile rejected successfully', data: provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider status (Availability, suspension etc)
// @route   PUT /api/providers/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to change status' });
    }

    if (typeof req.body.isAvailable !== 'undefined') {
      provider.isAvailable = req.body.isAvailable;
    }

    if (req.user.role === 'admin' && req.body.approvalStatus) {
      provider.approvalStatus = req.body.approvalStatus;
      provider.isApproved = req.body.approvalStatus === 'approved';
    }

    await provider.save();

    res.status(200).json({ success: true, message: 'Provider status updated', data: provider });
  } catch (error) {
    next(error);
  }
};
