const express = require('express');
const router = express.Router();
const UserInfo = require('../models/UserInfo');

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  try {
    const user = await UserInfo.findOne({ mobile_no: phone });

    if (!user) return res.status(404).json({ error: 'Phone not found. Request OTP first.' });

    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    if (user.otp_expiry < new Date()) return res.status(400).json({ error: 'OTP expired' });

    user.is_verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
