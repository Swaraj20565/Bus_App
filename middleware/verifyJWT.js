// const jwt = require('jsonwebtoken');

// const verifyJWT = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

//   if (!token) {
//     return res.status(401).json({ error: 'Access token missing' });
//   }

//   jwt.verify(token, 'your_secret_key', (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid or expired token' });
//     }

//     req.user = decoded; // decoded = { userId, phone, user_type_id, iat, exp }
//     next();
//   });
// };

// module.exports = verifyJWT;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserInfo = require('../models/UserInfo');

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  try {
    const user = await UserInfo.findOne({ mobile_no: phone });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please request OTP again.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.otp_expiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    user.is_verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    // Assume user is always registered if phone exists
    const isRegistered = true;

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.mobile_no,
        user_type_id: user.user_type_id,
      },
      'your_secret_key', // 🔐 Replace with env in production
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      isRegistered,
      token,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
