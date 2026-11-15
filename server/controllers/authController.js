const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'bitm_secure_jwt_secret_token_ballari_2024_key_99',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      usn,
      email,
      password,
      confirmPassword,
      department,
      semester,
      section,
      skills,
      interests,
      aboutMe
    } = req.body;

    // 1. Validation checks
    if (!fullName || !usn || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Full Name, USN, Email, Password, Department).'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate USN
    const cleanUSN = usn.trim().toUpperCase();
    const existingUSN = await User.findOne({ usn: cleanUSN });
    if (existingUSN) {
      return res.status(400).json({
        success: false,
        message: `A student account with USN '${cleanUSN}' already exists.`
      });
    }

    // Check duplicate email
    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${cleanEmail}' already exists.`
      });
    }

    // Process skills and interests arrays
    const formattedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.length > 0
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const formattedInterests = Array.isArray(interests)
      ? interests
      : typeof interests === 'string' && interests.length > 0
        ? interests.split(',').map(i => i.trim()).filter(Boolean)
        : [];

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      usn: cleanUSN,
      email: cleanEmail,
      password, // Pre-save hook in User model will hash this with bcrypt
      role: 'student',
      status: 'active',
      department,
      semester: Number(semester) || 1,
      section: section ? section.trim().toUpperCase() : 'A',
      skills: formattedSkills,
      interests: formattedInterests,
      aboutMe: aboutMe || '',
      headline: `Student at BITM | ${department}`
    });

    const token = generateToken(user._id);

    // Fetch user without password
    const safeUser = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the BITM Student Network.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

// @desc    Login student or admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email or USN and Password.'
      });
    }

    const cleanIdentifier = identifier.trim();

    // Check by email or USN (case insensitive)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { usn: cleanIdentifier.toUpperCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this Email or USN.'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password is incorrect.'
      });
    }

    // Check account status
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact BITM administration.'
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your registration is still pending admin approval.'
      });
    }

    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No student account registered with this email.'
      });
    }

    // In a real email system, we would email a token. For this college project, we provide a temporary reset token.
    const tempResetToken = jwt.sign(
      { id: user._id, type: 'reset' },
      process.env.JWT_SECRET || 'bitm_secure_jwt_secret_token_ballari_2024_key_99',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset link simulated. You may now reset your password.',
      resetToken: tempResetToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not process forgot password request.'
    });
  }
};

// @desc    Reset Password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || 'bitm_secure_jwt_secret_token_ballari_2024_key_99'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token.'
    });
  }
};
