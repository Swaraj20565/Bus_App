const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET user profile by username
router.get('/:username', async (req, res) => {
    res.send('Hi user');
//   try {
//     const user = await User.findOne({ username: req.params.username }).select('-password');
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(user);
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
});

module.exports = router;
