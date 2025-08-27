// models/OrderLocation.js
const mongoose = require('mongoose');

const orderLocationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
orderLocationSchema.index({ location: '2dsphere' });

// Add a compound index for better query performance
orderLocationSchema.index({
  status: 1,
  vehicleType: 1,
  location: '2dsphere'
});

module.exports = mongoose.model('OrderLocation', orderLocationSchema);