const User = require('../models/User');
const Provider = require('../models/Provider');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only user themselves or Admin can view user details
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this profile' });
    }

    let provider = null;
    if (user.role === 'provider') {
      provider = await Provider.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allow user themselves or Admin to update
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { name, phone, profileImage, isActive, password } = req.body;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (password) user.password = password; // This will trigger the pre-save bcrypt hashing hook!
    
    // Only Admin can update active status directly here, or user can deactivate themselves (set to false)
    if (typeof isActive !== 'undefined') {
      if (req.user.role === 'admin' || (req.user.id === user.id && isActive === false)) {
        user.isActive = isActive;
      }
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user is a provider, delete Provider document too
    if (user.role === 'provider') {
      await Provider.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
