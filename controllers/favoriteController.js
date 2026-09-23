const Favorite = require('../models/Favorite');
const Provider = require('../models/Provider');

// @desc    Get all favorite providers for customer
// @route   GET /api/favorites
// @access  Private/Customer
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customer: req.user.id })
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone profileImage' },
      });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites.map((f) => f.provider), // return list of provider profiles directly
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add provider to favorites
// @route   POST /api/favorites/:providerId
// @access  Private/Customer
exports.addFavorite = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      customer: req.user.id,
      provider: providerId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Provider is already in your favorites' });
    }

    await Favorite.create({
      customer: req.user.id,
      provider: providerId,
    });

    res.status(201).json({ success: true, message: 'Provider added to favorites' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove provider from favorites
// @route   DELETE /api/favorites/:providerId
// @access  Private/Customer
exports.removeFavorite = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;

    const favorite = await Favorite.findOneAndDelete({
      customer: req.user.id,
      provider: providerId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({ success: true, message: 'Provider removed from favorites' });
  } catch (error) {
    next(error);
  }
};
