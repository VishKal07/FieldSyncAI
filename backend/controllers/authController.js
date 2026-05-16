const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const buildToken = (user) => jwt.sign(
  {
    userId: user._id,
    role: user.role,
    name: user.name,
    region: user.region
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region,
  avatarInitials: user.avatarInitials
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account disabled' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = buildToken(user);
    
    res.json({
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!googleClient) {
      return res.status(500).json({ message: 'Google OAuth is not configured' });
    }

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }]
    });

    if (!user) {
      return res.status(404).json({
        message: 'No FieldSync account found for this Google email'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account disabled' });
    }

    if (!user.googleId) {
      user.googleId = payload.sub;
    }

    if (!user.avatarInitials && user.name) {
      user.avatarInitials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }

    await user.save();

    const token = buildToken(user);

    res.json({
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, googleLogin, getMe };