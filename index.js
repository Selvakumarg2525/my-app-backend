require('dotenv').config();
const express =  require("express")
const mongoose = require("mongoose")
const cors = require('cors');
const connectDB = require('./db');

const app = express();
// Enable CORS for Flutter app
app.use(cors({
  origin: '*' // For development only (restrict this in production)
}));
app.use(cors());
app.use(express.json());


connectDB();

 app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});