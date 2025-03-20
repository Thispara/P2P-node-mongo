const express = require('express');
const { connectDB } = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
connectDB();

app.use('/api', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});