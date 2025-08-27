const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
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
  baseRatePerKm: { type: Number, required: true }, // INR per km
  baseRatePerKg: { type: Number, required: true }, // INR per kg
  fuelMultiplier: { type: Number, required: true },
  driverRate: { type: Number, required: true }, // INR per hour
  coDriverRate: { type: Number, required: true }, // INR per hour

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

pricingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Pricing', pricingSchema);