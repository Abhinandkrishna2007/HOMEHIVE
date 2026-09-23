const User = require('../models/User');
const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');

// Sign JWT token helper
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'homehive_secret_jwt_key_987654321', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Customer or Provider)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      // Provider details (only for providers)
      businessName,
      category,
      experience,
      serviceArea,
      city,
      state,
      pincode,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
      profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });

    let provider = null;

    // If role is provider, create Provider profile
    if (role === 'provider') {
      if (!businessName || !category || !experience || !city || !state || !pincode) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'All provider business details are required for registration',
        });
      }

      provider = await Provider.create({
        user: user._id,
        businessName,
        category,
        experience,
        phone,
        email,
        description: req.body.description || `Hi, I am ${name}, providing professional ${category} services.`,
        serviceArea: serviceArea || city,
        city,
        state,
        pincode,
        profileImage: user.profileImage,
        isApproved: false, // Must be approved by admin
        approvalStatus: 'pending',
      });
    }

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'provider' ? 'Provider registered successfully and is pending approval.' : 'Registration successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        provider: provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Fetch provider details if user is a provider
    let provider = null;
    if (user.role === 'provider') {
      provider = await Provider.findOne({ user: user._id });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        provider: provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token (frontend client will discard token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        provider: provider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
  }
  res.status(200).json({
    success: true,
    message: 'Reset password link sent to registered email address (mock implementation)',
  });
};

// @desc    Reset Password (Mock)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Update password in mock
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  });
};
