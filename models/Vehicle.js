const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  captainId: { type: String, required: true, index: true },
  vehicleType: {
    type: String,
    required: true,
    enum: [
      'Two-Wheelers',
      'Three-Wheelers (Cargo Autos)',
      'Mini Trucks & Vans',
      'Medium Trucks',
      'Large Trucks',
      'Special Purpose Vehicles'
    ]
  },
  vehicleId: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  vehicleImage: {
    data: Buffer,
    contentType: String
  },
  registrationImage: {
    data: Buffer,
    contentType: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add compound index for better query performance
vehicleSchema.index({ captainId: 1, vehicleType: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);