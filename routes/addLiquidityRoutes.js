const express = require('express');
const router = express.Router();
const addLiquidity = require('../contracts/addLiquidity');

router.post('/addLiquidity', async (req, res) => {
  try {
    const result = await addLiquidity(); 
    if (result.success) {
      return res.json({ success: true, txHash: result.txHash });
    } else {
      return res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('[ERROR] addLiquidity route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
