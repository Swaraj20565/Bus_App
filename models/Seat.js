// const mongoose = require('mongoose');

// const seatSchema = new mongoose.Schema({
//   busId: String,
//   seatNo: String,
//   status: {
//     type: String,
//     enum: ['available', 'locked', 'booked'],
//     default: 'available'
//   },
//   lockedBy: String,
//   lockTime: Date
// });


// module.exports = mongoose.model('Seat', seatSchema);
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true
  },
  seatNo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'locked', 'booked'],
    default: 'available'
  },
  lockedBy: String,
  lockTime: Date
});

module.exports = mongoose.model('Seat', seatSchema);
