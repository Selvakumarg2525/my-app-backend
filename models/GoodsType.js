    const mongoose = require('mongoose');

    const goodsTypeSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: String,
      baseRate: { type: Number, required: true }, // Base rate per kg
      fragile: { type: Boolean, default: false },
      requiresSpecialHandling: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    });

    module.exports = mongoose.model('GoodsType', goodsTypeSchema);