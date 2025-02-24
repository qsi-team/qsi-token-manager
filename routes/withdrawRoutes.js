// routes/withdrawRoutes.js

const express = require('express');
const router = express.Router();
const withdrawLiquidity = require('../contracts/withdrawLiquidity');

// GET /withdraw - triggers liquidity withdrawal
router.get('/withdraw', async (req, res) => {
  try {
    const result = await withdrawLiquidity();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.toString() });
  }
});

module.exports = router;
