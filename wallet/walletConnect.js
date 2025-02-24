const rawTronWeb = require('tronweb');
const TronWebConstructor = rawTronWeb.TronWeb || rawTronWeb.default || rawTronWeb;
require('dotenv').config();


/**
 * Connect to the managing wallet via TronWeb.
 * Uses PRIVATE_KEY to sign transactions.
 */
const connectWallet = () => {
  try {
    const tronWeb = new TronWebConstructor({
      fullHost: 'https://api.trongrid.io',
      headers: { "TRON-PRO-API-KEY": process.env.API_KEY },
      privateKey: process.env.PRIVATE_KEY,
    });

    const walletAddress = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY);
    console.log(`[✅] TronWeb connected to managing wallet: ${walletAddress}`);

    return tronWeb;
  } catch (error) {
    console.error('[❌] Error connecting to TronWeb:', error);
    process.exit(1);
  }
};

module.exports = connectWallet;
