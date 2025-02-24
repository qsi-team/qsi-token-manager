// routes/statusRoutes.js

const express = require('express');
const router = express.Router();

// GET /status - Public endpoint to show scheduled job times
router.get('/status', (req, res) => {
  res.json({
    message: "QS Token Manager is running!",
    scheduledWithdraw: "Daily at 11:00 PM UTC",
    scheduledAddLiquidity: "Daily at 11:30 PM UTC"
  });
});

module.exports = router;
