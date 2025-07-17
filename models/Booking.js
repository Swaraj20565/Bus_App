const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  seatNo: {
    type: String,
    required: true
  },
  busId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'booked'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    default: 'paid'
  },
  transactionId: String
});

module.exports = mongoose.model('Booking', bookingSchema);
