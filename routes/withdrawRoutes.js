// routes/withdrawRoutes.js

const express = require('express');
const router = express.Router();
const withdrawLiquidity = require('../contracts/withdrawLiquidity');

// POST /withdraw
router.post('/withdraw', async (req, res) => {
  // 1) Check x-secret-key
  const secretFromHeader = req.headers['x-secret-key'];
  if (!secretFromHeader || secretFromHeader !== process.env.LIQUIDITY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2) Call withdrawLiquidity
  try {
    const result = await withdrawLiquidity();
    res.json(result);
  } catch (error) {
    console.error('[ERROR] withdraw route:', error);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

module.exports = router;
