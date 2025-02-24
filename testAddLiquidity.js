// testAddLiquidity.js

const addLiquidity = require('./contracts/addLiquidity');
require('dotenv').config();

const testAddLiquidity = async () => {
  console.log("🚀 Starting Liquidity Addition Test...");

  try {
    const result = await addLiquidity();

    if (result.success) {
      console.log(`✅ Liquidity added successfully! TX Hash: ${result.txHash}`);
    } else {
      console.log(`⚠️ Liquidity addition failed. Reason: ${result.message}`);
    }
  } catch (error) {
    console.error(`❌ Test failed with error: ${error.message}`);
  }
};

testAddLiquidity();
