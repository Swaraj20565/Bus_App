const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   userId: {
    type: String,
    unique: true
   },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // don't return password by default
  },
  profileImage: {
    type: String,
    default: ''
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Marathi'],
    default: 'English'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  savedRoutes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    }
  ],
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
