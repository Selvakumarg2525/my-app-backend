// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  captainId: { type: String, ref: 'User' },
  pickupDetails: {
    type: Object,
    required: true
  },
  dropDetails: {
    type: Object,
    required: true
  },
  packageDetails: {
    goodsType: String,
    vehicleType: String,
    weight: Number,
    hasCoDriver: Boolean,
    distance: Number
  },
  priceEstimate: {
    baseCost: Number,
    distanceCost: Number,
    fuelCost: Number,
    laborCost: Number,

    totalCost: Number
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'picked-up', 'delivered', 'completed', 'cancelled']
  },
  userConfirmation: { type: Boolean, default: false },
  captainConfirmation: { type: Boolean, default: false },
  review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: Date
  },
  review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date
    },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);