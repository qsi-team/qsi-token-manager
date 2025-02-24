// app.js

const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// Import routes
const withdrawRoutes = require('./routes/withdrawRoutes');
const addLiquidityRoutes = require('./routes/addLiquidityRoutes'); // <--- NEW

// Middleware
app.use(express.json());

// Mount routes
app.use('/', withdrawRoutes);
app.use('/', addLiquidityRoutes); // <--- NEW

app.get('/', (req, res) => {
  res.send('QS Token Manager API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
