const jwt = require('jsonwebtoken'); // at top
const express = require('express');
const router = express.Router();
const Authuser = require('../models/Authuser');
const UserInfo = require('../models/UserInfo');


router.post('/register', async (req, res) => {
  const { phone, username, first_name, last_name, email, user_type_id } = req.body;
  console.log(first_name);
  

  try {
    const existingUser = await Authuser.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    if (![1, 2].includes(user_type_id)) {
      return res.status(400).json({ error: 'Invalid user_type_id. Must be 1 (User) or 2 (Admin)' });
    }

    const preUser = await UserInfo.findOne({ mobile_no: phone });
    if (!preUser || !preUser.is_verified) {
      return res.status(403).json({ error: 'OTP not verified. Please verify before registering.' });
    }

    const newUser = new Authuser({
      phone,
      username,
      first_name,
      last_name,
      email,
      user_type_id,
      is_verified: true
    });

    await newUser.save();
    await UserInfo.deleteOne({ mobile_no: phone }); // optional cleanup

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, phone: newUser.phone, user_type_id: newUser.user_type_id },
      'your_secret_key', // Use .env in production!
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;