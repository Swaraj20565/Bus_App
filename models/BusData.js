const mongoose = require('mongoose');

// Define each stop with time and fare info
const stopSchema = new mongoose.Schema({
  stopName: {
    type: String,
    required: true
  },
  arrivalTime: String,        // Optional for first stop
  departureTime: String,      // Optional for last stop
  fareToNext: Number          // Fare from this stop to the next
});

// Define main bus schema
const busDataSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true
  },
  busName: {
    type: String,
    required: true
  },
  date: {
    type: String,             // Example: "2025-06-28"
    required: true
  },
  route: {
    type: [stopSchema],
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('BusData', busDataSchema);
