require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');
    return mongoose.connection;
//    const testDoc = await mongoose.connection.db.collection('Signup').insertOne({
//          phone_number: '234567890543',
//          user_name:'Selva Kumar',
//          password:'123'
//        });
//        console.log('Test document inserted:', testDoc.insertedId);
//        console.log(mongoose.connection.name);
    // Close the connection after successful test

  } catch (error) {
    console.error('Connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectToDatabase;