const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

router.get('/cancel-ticket', async (req, res) => {
  const { userId, busId, seatNo } = req.body;

  if (!userId || !busId || !seatNo) {
    return res.status(400).json({ message: 'userId, busId, and seatNo are required' });
  }

  try {
    // 1. Update Seat: set to available
    const seatUpdateResult = await Seat.updateOne(
      { busId, seatNo },
      {
        $set: {
          status: 'available',
          lockedBy: null,
          lockTime: null
        }
      }
    );
    console.log('Seat updated:', seatUpdateResult);

    // 2. Delete the booking
    const result = await Booking.deleteOne({ userId, busId, seatNo });
    console.log('Booking deleted:', result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Booking not found for cancellation' });
    }

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
