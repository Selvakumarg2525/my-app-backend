const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: { type: String, enum: ['user', 'captain'], required: true },
  phoneNumber: { type: String, required: true, unique: true ,set: function(phone) {
                                                                   // Normalize phone number on save
                                                                   return phone.replace(/\D/g, ''); // Remove all non-digit characters
                                                               }},
  name: { type: String, required: true },
  shortName: { type: String },
  verificationId: {
      data: Buffer, // Store image binary data
      contentType: String // Store MIME type (e.g., 'image/jpeg')
    },
  captainId: { type: String, default: undefined},
  passkey: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  fcmToken: String
});

userSchema.index({ captainId: 1 }, {
   unique: true,
      sparse: true,
  collation: { locale: 'en', strength: 2 }
});
module.exports = mongoose.model('User', userSchema);