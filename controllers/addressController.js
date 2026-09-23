const Address = require('../models/Address');

// @desc    Get all addresses of logged-in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: addresses.length, data: addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { label, house, street, area, city, state, pincode, landmark, isDefault } = req.body;

    // If this is set to default, set all other user addresses to isDefault = false
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    // Check if it's the first address, default it anyway
    const count = await Address.countDocuments({ user: req.user.id });
    const makeDefault = count === 0 ? true : !!isDefault;

    const address = await Address.create({
      user: req.user.id,
      label: label || 'Home',
      house,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      isDefault: makeDefault,
    });

    res.status(201).json({ success: true, message: 'Address saved successfully', data: address });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this address' });
    }

    const { isDefault } = req.body;

    // If setting to default, unset other user addresses
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Address updated successfully', data: address });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(req.params.id);

    // If we deleted the default, set another address as default
    if (wasDefault) {
      const another = await Address.findOne({ user: req.user.id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};
