const express = require('express');
const router = express.Router();
const BusData = require('../models/BusData');

router.post('/add-bus', async (req, res) => {
  try {
    const { busNumber, busName, date, route, totalSeats } = req.body;

    if (!busNumber || !busName || !date || !route || !totalSeats) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const newBus = new BusData({
      busNumber,
      busName,
      date,
      route,
      totalSeats,
      availableSeats: totalSeats // Initially all seats are available
    });

    const savedBus = await newBus.save();

    res.status(201).json({ message: 'Bus added successfully', bus: savedBus });
  } catch (error) {
    console.error('Error adding bus:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
