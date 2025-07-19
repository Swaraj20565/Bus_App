const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Authuser = require('../models/Authuser');

// Login Route
router.post('/login', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }

  try {
    const user = await Authuser.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_verified) {
      if (!otp) {
        return res.status(400).json({ error: 'OTP is required for unverified users' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      if (user.otp_expiry < new Date()) {
        return res.status(400).json({ error: 'OTP expired' });
      }

      // Mark user as verified
      user.is_verified = true;
      user.otp = null;
      user.otp_expiry = null;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, user_type_id: user.user_type_id },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
