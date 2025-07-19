const express = require('express');
const router = express.Router();
const UserInfo = require('../models/UserInfo'); // Make sure the path is correct

// Utility to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    let user = await UserInfo.findOne({ mobile_no: phone });

    if (user) {
      user.otp = otp;
      user.otp_expiry = otpExpiry;
      console.log('OTP:', otp);
    } else {
      console.log('OTP:', otp);
      user = new UserInfo({
        mobile_no: phone,
        otp,
        otp_expiry: otpExpiry
      });
    }

    await user.save();

    console.log('OTP:', otp); // 🟡 In production, replace with actual SMS gateway logic

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
