// const express = require('express');
// const router = express.Router();

// const Booking = require('../models/Booking');
// const BusData = require('../models/BusData'); // ✅ Correct model
// const Seat = require('../models/Seat'); // ✅ Correct model

// router.get('/view-ticket', async (req, res) => {
//   const { userId, busId } = req.query;
//   console.log(userId, busId);

//   if (!userId || !busId) {
//     return res.status(400).json({ message: 'userId and busId are required' });
//   }

//   try {
//     const booking = await Booking.findOne({ userId, busId });
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     const bus = await BusData.findOne({ busNumber: busId }); // ✅ Correct lookup
//     // const Seat = await Seat.findOne({ busId: busId, }); // ✅ Correct lookup
//     if (!bus) {
//       return res.status(404).json({ message: 'Bus not found' });
//     }

//     const ticket = {
//       bookingId: booking._id,
//       userId: booking.userId,
//       busNumber: bus.busNumber,
//       busName: bus.busName,
//       from: booking.from,
//       to: booking.to,
//       seatNo: booking.seatNo,
//       date: bus.date,
//       status: booking.status,
//       bookingTime: booking.bookingTime,
//       route: bus.route
//     };

//     res.json(ticket);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();

const Booking = require('../models/Booking');
const BusData = require('../models/BusData');
const Seat = require('../models/Seat');

router.get('/view-ticket', async (req, res) => {
  const { userId, busId, seatNo } = req.query;
  console.log('userId:', userId, 'busId:', busId, 'seatNo:', seatNo);

  // Validate required fields
  if (!userId || !busId || !seatNo) {
    return res.status(400).json({ message: 'userId, busId, and seatNo are required' });
  }

  // Convert seatNo to array (supports comma-separated string)
  const seatNos = Array.isArray(seatNo)
    ? seatNo
    : seatNo.split(',').map(s => s.trim());

  try {
    // Find booking with userId, busId, and matching seat(s)
    const booking = await Booking.findOne({
      userId,
      busId,
      seatNo: { $in: seatNos }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Find bus info
    const bus = await BusData.findOne({ busNumber: busId });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Get seat details
    const seatDetails = await Seat.find({
      busId,
      seatNo: { $in: seatNos }
    }).select('-_id seatNo isBooked');

    // Build response
    const ticket = {
      bookingId: booking._id,
      userId: booking.userId,
      busNumber: bus.busNumber,
      busName: bus.busName,
      from: booking.from,
      to: booking.to,
      seatNo: seatNos,
      seatDetails: seatDetails,
      date: bus.date,
      status: booking.status,
      bookingTime: booking.bookingTime,
      route: bus.route
    };

    res.json(ticket);
  } catch (err) {
    console.error('Error in /view-ticket:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
