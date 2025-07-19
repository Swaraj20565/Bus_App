const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Seat = require('./models/Seat'); // Mongoose model
const Booking = require('./models/Booking');
const BusData = require('./models/BusData');
const busRoutes = require('./routes/bus');
const viewTicketRoutes = require('./routes/viewTicket');
const cancelTicketRoute = require('./routes/cancelTicket');
const adminBookingsRoute = require('./routes/adminBookings');
const addBusRoute = require('./routes/addBus');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User'); // Adjust the path
const authRoutes = require('./routes/auth');
const verifyOtpRouter = require('./routes/verifyOtpRouter');

const sendOtpRouter = require('./routes/sendOtpRouter');
const Authlogin = require('./routes/login');
const Authuser = require('./models/Authuser');
const jwt = require('jsonwebtoken');

const { log } = require('console');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/buses', busRoutes);


// Routes
app.use('/api', adminBookingsRoute);
app.use('/api', addBusRoute);
app.use('/api', authRoutes);
app.use('/api/',Authlogin);

// Use sendOtp router
app.use('/api', sendOtpRouter);
app.use('/api', verifyOtpRouter);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/busApp')
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ========================
// API ROUTES
// ========================

// app.get('/api/seats', async (req, res) => {
//   console.log('hi');

//   // const busId = req.params.busId;
//   // res.send(`Bus ID: ${busId}`);
// });


// Get all seats for a bus
// app.get('/api/seats/:busId', async (req, res) => {
//   console.log(busId);

// try {
//   const seats = await Seat.find({ busId: req.params.busId });
//   res.json(seats);
// } catch (err) {
//   res.status(500).json({ success: false, message: "Failed to fetch seats" });
// }
// });

// app.post('/api/lock', async (req, res) => {
//   const { seatNo, busId, userId } = req.body;
//   console.log(seatNo);

//   try {
//     // First, check if seat exists
//     const existingSeat = await Seat.findOne({ seatNo, busId });

//     if (!existingSeat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Seat does not exist in the database'
//       });
//     }

//     if (existingSeat.status !== 'available') {
//       return res.status(400).json({
//         success: false,
//         message: 'Seat already locked or booked'
//       });
//     }

//     // Lock the seat
//     existingSeat.status = 'locked';
//     existingSeat.lockedBy = userId;
//     existingSeat.lockTime = new Date();
//     await existingSeat.save();

//     io.emit('seat_update', {
//       seatNo: existingSeat.seatNo,
//       busId: existingSeat.busId,
//       status: 'locked',
//       userId: existingSeat.lockedBy
//     });

//     res.json({ success: true, message: 'Seat locked successfully', seat: existingSeat });

//   } catch (err) {
//     console.error("Lock Error:", err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

app.get('/api/userss/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId: userId }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// app.use('/api/users', userRoute);
app.post('/api/lock', async (req, res) => {
  const { seatNo, busId, userId } = req.body;

  // Ensure seatNo is an array
  if (!Array.isArray(seatNo)) {
    return res.status(400).json({
      success: false,
      message: 'seatNo must be an array'
    });
  }

  const lockedSeats = [];
  const failedSeats = [];

  try {
    for (const seat of seatNo) {
      const existingSeat = await Seat.findOne({ seatNo: seat, busId });

      if (!existingSeat) {
        failedSeats.push({ seatNo: seat, reason: 'Seat not found' });
        continue;
      }

      if (existingSeat.status !== 'available') {
        failedSeats.push({ seatNo: seat, reason: 'Seat not available' });
        continue;
      }

      // Lock the seat
      existingSeat.status = 'locked';
      existingSeat.lockedBy = userId;
      existingSeat.lockTime = new Date();
      await existingSeat.save();

      io.emit('seat_update', {
        seatNo: existingSeat.seatNo,
        busId: existingSeat.busId,
        status: 'locked',
        userId: existingSeat.lockedBy
      });

      lockedSeats.push(existingSeat);
    }

    res.json({
      success: true,
      message: `${lockedSeats.length} seat(s) locked successfully`,
      lockedSeats,
      failedSeats
    });

  } catch (err) {
    console.error("Lock Error:", err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ========================
// SEARCH ROUTE (Directly in index.js)
// ========================
// app.get('/api/search', async (req, res) => {
//   const { source, destination, date } = req.query;

//   try {
//     // Find buses on the given date
//     const buses = await BusData.find({ date });

//     const results = [];

//     for (const bus of buses) {
//       const route = bus.route;

//       const sourceIndex = route.findIndex(stop => stop.stopName.toLowerCase() === source.toLowerCase());
//       const destIndex = route.findIndex(stop => stop.stopName.toLowerCase() === destination.toLowerCase());

//       if (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex) {
//         let totalFare = 0;
//         for (let i = sourceIndex; i < destIndex; i++) {
//           totalFare += route[i].fareToNext || 0;
//         }

//         results.push({
//           busId: bus._id,
//           busNumber: bus.busNumber,
//           busName: bus.busName,
//           totalFare,
//           departureTime: route[sourceIndex].departureTime || '',
//           arrivalTime: route[destIndex].arrivalTime || '',
//           from: source,
//           to: destination,
//         });
//       }
//     }

//     res.json({ success: true, buses: results });
//   } catch (err) {
//     console.error('Search Error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

app.get('/api/search', async (req, res) => {
  const { source, destination, date } = req.query;

  if (!source || !destination || !date) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameters: source, destination, or date',
    });
  }

  try {
    // Find all buses running on the given date
    const buses = await BusData.find({ date });

    const results = [];

    for (const bus of buses) {
      const route = bus.route;

      const sourceIndex = route.findIndex(
        stop => stop.stopName.toLowerCase() === source.toLowerCase()
      );

      const destIndex = route.findIndex(
        stop => stop.stopName.toLowerCase() === destination.toLowerCase()
      );

      if (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex) {
        let totalFare = 0;
        for (let i = sourceIndex; i < destIndex; i++) {
          totalFare += route[i].fareToNext || 0;
        }

        results.push({
          busId: bus._id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          totalFare,
          departureTime: route[sourceIndex].departureTime || '',
          arrivalTime: route[destIndex].arrivalTime || '',
          from: source,
          to: destination,
          stopNames: route.map(stop => stop.stopName), // ✅ Add stopNames
        });
      }
    }

    res.status(200).json({ success: true, buses: results });

  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// app.post('/api/book', async (req, res) => {
//   const { seatNos, userId } = req.body;

//   const lockedSeats = await Seat.find({
//     seatNo: { $in: seatNos },
//     lockedBy: userId,
//     status: 'locked'
//   });

//   if (lockedSeats.length !== seatNos.length) {
//     return res.status(400).json({
//       success: false,
//       message: 'Some seats are not locked by you or already booked'
//     });
//   }

//   await Seat.updateMany(
//     { seatNo: { $in: seatNos }, lockedBy: userId, status: 'locked' },
//     { $set: { status: 'booked', lockedBy: userId, lockTime: new Date() } }  );

//   io.emit('seat_update', {
//     seatNos,
//     status: 'booked'
//   });

//   res.json({
//     success: true,
//     message: 'Seats booked successfully',
//     bookedSeats: seatNos
//   });
// });




// ========================
// SOCKET.IO EVENTS
// ========================
// Example: const Booking = require('./models/Booking');

app.get('/api/booking-view', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    console.log(bookings); // Log to server terminal
    res.json(bookings);    // Send data as JSON to frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

app.use('/api', authRoutes);





app.post('/api/book', async (req, res) => {
  const { seatNos, userId, busId, from, to, transactionId, paymentStatus = 'paid' } = req.body;

  if (!Array.isArray(seatNos) || seatNos.length === 0 || !userId || !busId || !from || !to) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input: Provide seatNos[], userId, busId, from, and to'
    });
  }

  try {
    const lockedSeats = await Seat.find({
      seatNo: { $in: seatNos },
      lockedBy: userId,
      status: 'locked'
    });

    if (lockedSeats.length !== seatNos.length) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are not locked by you or already booked'
      });
    }

    const result = await Seat.updateMany(
      {
        seatNo: { $in: seatNos },
        lockedBy: userId,
        status: 'locked'
      },
      {
        $set: {
          status: 'booked',
          lockTime: new Date()
        }
      }
    );

    if (result.modifiedCount !== seatNos.length) {
      return res.status(500).json({
        success: false,
        message: 'Failed to book all seats. Please try again.'
      });
    }

    // Store booking entries
    const bookings = seatNos.map(seatNo => ({
      seatNo,
      userId,
      busId,
      from,
      to,
      status: 'booked',
      bookingTime: new Date(),
      paymentStatus,
      transactionId
    }));

    await Booking.insertMany(bookings);

    io.emit('seat_update', {
      seatNos,
      status: 'booked'
    });

    res.json({
      success: true,
      message: 'Seats booked successfully',
      bookedSeats: seatNos
    });

  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during booking'
    });
  }
});

app.get('/api/seats/:busId', async (req, res) => {
  try {
    const busId = req.params.busId;
    const seats = await Seat.find({ busId });

    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});





app.use('/api', viewTicketRoutes);

// app.get('/cancel-tickets', async (req, res) => {


//   const { userId, busId, seatNo } = req.body;
//   console.log(userId);
//   console.log(busId);
//   console.log(seatNo);
  

//   if (!userId || !busId || !seatNo) {
//     return res.status(400).json({ message: 'userId, busId, and seatNo are required' });
//   }

//   try {
//     // 1. Update Seat: set to available
//     const seatUpdateResult = await Seat.updateOne(
//       { busId, seatNo },
//       {
//         $set: {
//           status: 'available',
//           lockedBy: null,
//           lockTime: null
//         }
//       }
//     );
//     console.log('Seat updated:', seatUpdateResult);

//     // 2. Delete the booking
//     const result = await Booking.deleteOne({ userId, busId, seatNo });
//     console.log('Booking deleted:', result);

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'Booking not found for cancellation' });
//     }

//     res.json({ message: 'Ticket cancelled successfully' });
//   } catch (error) {
//     console.error('Error cancelling ticket:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.post('/hi',(req,res)=>{
  const { phone, username, first_name, last_name, email } = req.body;
  console.log(email);
  
  res.send('hello');
})


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/register', async (req, res) => {
  const { phone, username, first_name, last_name, email } = req.body;

  try {
    // Optional: Check for existing user
    const existingUser = await Authuser.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    const otp = generateOTP();
    console.log(otp);
    
    // Create new user instance
    const AuthUser = new Authuser();
    AuthUser.phone = phone;
    AuthUser.username = username;
    AuthUser.first_name = first_name;
    AuthUser.last_name = last_name;
    AuthUser.email = email;

    // Save to DB
    await AuthUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.post('/cancel-tickets', async (req, res) => {
  const { userId, busId, seatNo } = req.body;
  console.log(userId, busId, seatNo);

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


io.on('connection', socket => {
  console.log('User connected');

  // Lock seat
  socket.on('lock_seat', async ({ busId, seatNo, userId }) => {
    try {
      const seat = await Seat.findOne({ busId, seatNo });

      if (seat && seat.status === 'available') {
        seat.status = 'locked';
        seat.lockedBy = userId;
        seat.lockTime = new Date();
        await seat.save();

        io.emit('seat_update');
      } else {
        socket.emit('lock_failed', {
          seatNo,
          reason: 'Seat is not available for locking.'
        });
      }
    } catch (err) {
      console.error('Lock Error:', err);
    }
  });

  // Unlock seat
  socket.on('unlock_seat', async ({ busId, seatNo, userId }) => {
    try {
      const seat = await Seat.findOne({ busId, seatNo });

      if (seat && seat.status === 'locked' && seat.lockedBy === userId) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockTime = null;
        await seat.save();

        io.emit('seat_update');
      }
    } catch (err) {
      console.error('Unlock Error:', err);
    }
  });
});

// ========================
// AUTO UNLOCK (EXPIRE LOCKS AFTER 5 MINS)
// ========================
setInterval(async () => {
  const expiryTime = new Date(Date.now() - 1 * 60 * 1000); // 5 mins
  await Seat.updateMany(
    { status: 'locked', lockTime: { $lt: expiryTime } },
    { $set: { status: 'available', lockedBy: null, lockTime: null } }
  );
  io.emit('seat_update');
}, 60 * 1000); // Every 1 minute

// ========================
// START SERVER
// ========================
app.listen(8082, () => {
  console.log('Server is running on port 8081');
});
