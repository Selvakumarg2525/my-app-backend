const mongoose = require('mongoose');
const GoodsType = require('./models/GoodsType');
require('dotenv').config();

const goodsTypes = [
  {
    name: 'Electronics',
    description: 'Phones, laptops, and other electronic devices',
    baseRate: 1,// Now directly in INR
    fragile: true,
    requiresSpecialHandling: true
  },
  {
    name: 'Furniture',
    description: 'Household furniture items',
    baseRate: 2,// Directly in INR
    fragile: false,
    requiresSpecialHandling: false
  },
  {
    name: 'Clothing',
    description: 'Bags of clothes and textiles',
    baseRate: 1,// Directly in INR
    fragile: false,
    requiresSpecialHandling: false
  },
  {
    name: 'Metals',
    description: 'Metal sheets, rods, and other metal products',
    baseRate: 3,// Directly in INR
    fragile: false,
    requiresSpecialHandling: true
  },
  {
    name: 'Plastics',
    description: 'Plastic materials and products',
    baseRate: 1,// Directly in INR
    fragile: false,
    requiresSpecialHandling: false
  },
  {
    name: 'Bricks',
    description: 'Construction bricks and blocks',
    baseRate: 2,// Directly in INR
    fragile: false,
    requiresSpecialHandling: false
  },
  {
    name: 'Groceries',
    description: 'Food items and grocery products',
    baseRate: 1,// Directly in INR
    fragile: true,
    requiresSpecialHandling: false
  },
  {
    name: 'Vehicles',
    description: 'Cars, bikes, and other vehicles',
    baseRate: 5,// Directly in INR
    fragile: true,
    requiresSpecialHandling: true
  },
  {
    name: 'Machineries',
    description: 'Industrial machines and equipment',
    baseRate: 5,// Directly in INR
    fragile: true,
    requiresSpecialHandling: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await GoodsType.deleteMany({});
    console.log('Cleared existing goods types');

    await GoodsType.insertMany(goodsTypes);
    console.log('Added new goods types');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();