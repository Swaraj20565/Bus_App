const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.get('/admin/bookings', async (req, res) => {
    const { busId } = req.query;
  
    if (!busId) {
      return res.status(400).json({ message: 'busId is required' });
    }
  
    try {
      const bookings = await Booking.find({ busId });
  
      if (bookings.length === 0) {
        return res.status(404).json({ message: 'No bookings found for this bus'});
      }
  
      res.json({ busId, totalBookings: bookings.length, bookings });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;