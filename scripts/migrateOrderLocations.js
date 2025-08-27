// scripts/migrateOrderLocations.js
const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order');
const OrderLocation = require('../models/OrderLocation');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to migrate`);

    for (const order of orders) {
      const exists = await OrderLocation.findOne({ orderId: order._id });
      if (!exists) {
        const location = new OrderLocation({
          orderId: order._id,
          location: {
            type: 'Point',
            coordinates: [
              order.pickupDetails.location.lng,
              order.pickupDetails.location.lat
            ]
          },
          vehicleType: order.packageDetails.vehicleType,
          status: order.status
        });
        await location.save();
        console.log(`Migrated order ${order._id}`);
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();