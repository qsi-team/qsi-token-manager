const connectWallet = require('./wallet/walletConnect');

const testConnection = async () => {
  const tronWeb = connectWallet();

  try {
    // Get the base58 address of the managing wallet
    const address = tronWeb.defaultAddress.base58;
    console.log(`[👛] Managing wallet address: ${address}`);

    // Optionally, check the balance of the managing wallet
    const balance = await tronWeb.trx.getBalance(address);
    console.log(`[💰] Wallet balance: ${(balance / 1e6).toFixed(2)} TRX`);
  } catch (error) {
    console.error('[❌] Error testing wallet connection:', error);
  }
};

testConnection();
