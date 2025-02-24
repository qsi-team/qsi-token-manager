// app.js

const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// Import routes
const withdrawRoutes = require('./routes/withdrawRoutes');
const addLiquidityRoutes = require('./routes/addLiquidityRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Middleware
app.use(express.json());

// Mount routes
app.use('/', statusRoutes);
app.use('/', withdrawRoutes);
app.use('/', addLiquidityRoutes);

// Basic root endpoint
app.get('/', (req, res) => {
  res.send('QS Token Manager API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
