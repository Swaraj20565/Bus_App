const mongoose = require('mongoose');

const AuthuserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  username: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  user_type_id: { type: Number, enum: [1, 2], required: true }, // 1: User, 2: Admin
  otp: { type: String },
  otp_expiry: { type: Date },
  is_verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Authuser', AuthuserSchema);
