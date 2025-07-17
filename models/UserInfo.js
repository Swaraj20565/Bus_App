const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
  mobile_no: { type: String, required: true, unique: true },
  otp: String,
  otp_expiry: Date,
  is_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInfo', UserInfoSchema);
