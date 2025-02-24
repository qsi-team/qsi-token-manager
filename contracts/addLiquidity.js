// contracts/addLiquidity.js

const connectWallet = require('../wallet/walletConnect');
const sendLogToChannel = require('../telegram/sendTelegram'); // Telegram notifications
const sendWebhook = require('../webhook/sendWebhook');        // Webhook notifications
const BigNumber = require('bignumber.js');
const axios = require('axios');
require('dotenv').config();

const TOKEN_ID = 765;
const TRX_DECIMALS = 1e6; // TRX / WTRX decimals
const QSI_DECIMALS = 1e6; // QSI decimals
const PRICE_API_URL = process.env.SUN_IO_API_URL || "https://rot.endjgfsv.link/swap/router";

const trc20Abi = [
  {
    "type": "function",
    "name": "approve",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value",   "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "outputs": [{ "name": "balance", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "deposit", // for WTRX
    "stateMutability": "payable",
    "inputs": [],
    "outputs": []
  }
];

// increaseLiquidity ABI (tuple)
const nftManagerABI = [
  {
    "name": "increaseLiquidity",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "components": [
          { "name": "tokenId",         "type": "uint256" },
          { "name": "amount0Desired",  "type": "uint256" },
          { "name": "amount1Desired",  "type": "uint256" },
          { "name": "amount0Min",      "type": "uint256" },
          { "name": "amount1Min",      "type": "uint256" },
          { "name": "deadline",        "type": "uint256" }
        ]
      }
    ],
    "outputs": [
      { "name": "liquidity", "type": "uint128" },
      { "name": "amount0",   "type": "uint256" },
      { "name": "amount1",   "type": "uint256" }
    ]
  }
];

// For infinite approve
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

/**
 * Fetch price from the API. We'll parse "inUsd" and "amountOut".
 * Since we do fromToken=WTRX => toToken=QSI, the API data includes:
 * "amountOut" (QSI in "human" format),
 * "inUsd" (the USD value of the fromToken).
 */
async function fetchPriceFromAPI(fromToken, toToken, amountInSun) {
  console.log(`[DEBUG] fetchPriceFromAPI: fromToken=${fromToken}, toToken=${toToken}, amountInSun=${amountInSun}`);
  const url = `${PRICE_API_URL}?fromToken=${fromToken}&toToken=${toToken}&amountIn=${amountInSun}&typeList=SUNSWAP_V3`;

  const response = await axios.get(url);
  if (response.data && response.data.code === 0 && response.data.data.length > 0) {
    console.log("[DEBUG] API response:", JSON.stringify(response.data, null, 2));

    // "amountOut" => how many QSI in "human" format. "inUsd" => total USD for fromToken
    const dataItem   = response.data.data[0];
    const amountOut  = dataItem.amountOut;  // e.g. "45.123456" QSI
    const inUsd      = dataItem.inUsd;      // e.g. "12.347279326873283050000000"

    const amountOutBN = new BigNumber(amountOut);
    const inUsdBN     = new BigNumber(inUsd);

    // Convert QSI to SUN
    const amountOutSun = amountOutBN.times(QSI_DECIMALS).toFixed(0);

    // We'll compute "1 QSI = ??? USD" => inUsd / amountOut
    let priceQsiUsd = "0.00";
    if (!amountOutBN.isZero()) {
      const usdPerQsiBN = inUsdBN.div(amountOutBN);
      priceQsiUsd = usdPerQsiBN.toFixed(2); // round to 2 decimals
    }

    return {
      amountOutSun,
      priceQsiUsd
    };
  } else {
    throw new Error("Invalid API response for price data");
  }
}

async function addLiquidity() {
  try {
    const tronWeb = connectWallet();
    const managingWallet = tronWeb.defaultAddress.base58;
    console.log(`[INFO] Managing wallet: ${managingWallet}`);

    const nftManagerAddress = process.env.NONFUNGIBLE_POSITION_MANAGER_ADDRESS;
    if (!nftManagerAddress) {
      throw new Error("NONFUNGIBLE_POSITION_MANAGER_ADDRESS is not set");
    }

    // token0 = WTRX, token1 = QSI
    const wtrxAddress = process.env.WTRX_ADDRESS || "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
    const qsiAddress  = process.env.QSI_TOKEN_ADDRESS;
    if (!qsiAddress) {
      throw new Error("QSI_TOKEN_ADDRESS is missing");
    }

    // 1) Get TRX balance
    const walletBalanceSun = await tronWeb.trx.getBalance(managingWallet);
    const walletBalanceTRX = new BigNumber(walletBalanceSun).div(TRX_DECIMALS);
    console.log(`[INFO] Wallet TRX balance: ${walletBalanceTRX.toFixed(6)}`);

    // If below 10 TRX => skip
    if (walletBalanceSun < 10 * TRX_DECIMALS) {
      const postponedMsg =
        `🚀 Liquidity Addition Report - Daily Automatic Liquidity Addition\n\n` +
        `💰 Managing wallet balance is too low: ${walletBalanceTRX.toFixed(2)} TRX\n` +
        `⚠️ Not enough TRX to add liquidity. We will try again tomorrow.`;
      await sendLogToChannel(postponedMsg);
      return { success: false, reason: "Insufficient TRX" };
    }

    // 2) amount0Desired = 2.11% of TRX, min 50
    let amount0TRX = walletBalanceTRX.multipliedBy(0.0211);
    if (amount0TRX.isLessThan(50)) {
      amount0TRX = new BigNumber(50);
    }
    const amount0Sun = amount0TRX.times(TRX_DECIMALS).toFixed(0);
    console.log(`[INFO] amount0Desired = ${amount0TRX.toFixed(6)} TRX => ${amount0Sun} SUN`);

    // 3) Wrap TRX -> WTRX if needed
    const wtrxContract = await tronWeb.contract(trc20Abi, wtrxAddress);
    const wtrxBalanceSun = await wtrxContract.methods.balanceOf(managingWallet).call();
    const wtrxBalanceBN  = new BigNumber(wtrxBalanceSun);
    const deficit = new BigNumber(amount0Sun).minus(wtrxBalanceBN);
    if (deficit.isGreaterThan(0)) {
      console.log(`[INFO] Wrapping deficit ${deficit.toString()} from TRX to WTRX...`);
      await wtrxContract.methods.deposit().send({
        feeLimit: 100_000_000,
        callValue: deficit.toFixed(0) // TRX in SUN
      });
      console.log("[INFO] WTRX deposit done.");
    }

    // 4) fetch how many QSI => we read inUsd to compute "1 QSI=??USD"
    const { amountOutSun, priceQsiUsd } = await fetchPriceFromAPI(wtrxAddress, qsiAddress, amount0Sun);
    const amount1SunBN = new BigNumber(amountOutSun);
    const amount1Sun   = amount1SunBN.toFixed(0);
    const amount1QSI   = amount1SunBN.div(QSI_DECIMALS);
    console.log(`[INFO] amount1Desired => ${amount1QSI.toFixed(6)} QSI => ${amount1Sun} SUN`);

    // 5) Approve WTRX + QSI unlimited
    const qsiContract = await tronWeb.contract(trc20Abi, qsiAddress);

    console.log("[INFO] Approving WTRX infinite for NFT Manager...");
    await wtrxContract.methods.approve(nftManagerAddress, MAX_UINT256).send({ feeLimit: 100_000_000 });
    console.log("[INFO] Approving QSI infinite for NFT Manager...");
    await qsiContract.methods.approve(nftManagerAddress, MAX_UINT256).send({ feeLimit: 100_000_000 });

    // 6) NonfungiblePositionManager
    const nftManager = await tronWeb.contract(nftManagerABI, nftManagerAddress);

    // 7) Slippage 1% => 0.99
    const minAmount0Sun = new BigNumber(amount0Sun).times(0.000001).toFixed(0);
    const minAmount1Sun = amount1SunBN.times(0.000001).toFixed(0);
    const deadline = (Math.floor(Date.now() / 1000) + 600).toString();

    // Build array
    const paramsArray = [
      TOKEN_ID.toString(),
      amount0Sun,
      amount1Sun,
      minAmount0Sun,
      minAmount1Sun,
      deadline
    ];
    console.log("[DEBUG] increaseLiquidity param array:", paramsArray);

    // 8) Call increaseLiquidity
    const tx = await nftManager.methods.increaseLiquidity(paramsArray).send({
      feeLimit: 100_000_000
    });
    const txHash = tx.txid || tx;
    console.log(`[✅] Liquidity added. TX: ${txHash}`);

    // 9) Telegram message
    const currentTime = new Date().toISOString();
    const ratioQsiToTrx = amount0TRX.div(amount1QSI.isZero() ? 1 : amount1QSI);
    const qsiToTrxStr   = ratioQsiToTrx.isNaN() ? "0.00" : ratioQsiToTrx.toFixed(2);

    const successMsg =
      `🚀 Liquidity Addition Report - Daily automatic Liquidity Addition\n\n` +
      `💰 Managing wallet balance: ${walletBalanceTRX.toFixed(2)} TRX\n` +
      `📥 Added to the pool: +${amount0TRX.toFixed(2)} TRX & +${amount1QSI.toFixed(2)} QSI\n` +
      `💵 1 QSI = ${qsiToTrxStr} TRX\n` +
      `💲 1 QSI = ${priceQsiUsd} USD\n` +
      `⏰ Time: ${currentTime}`;

	const inlineKeyboard = {
	  reply_markup: {
	    inline_keyboard: [
	      // 1) Existing button "Buy QSI Directly"
	      [{ text: "💰 Buy QSI Directly", url: "https://quickshooters.com/buyqsi" }],
	
	      // 2) Existing button "Lock & Unlock"
	      [{ text: "⏳ QSI Lock & Unlock Timeline", url: "https://quickshooters.com/swapqsi" }],
	
	      // 3) GeckoTerminal link
	      [{ text: "🌐 GeckoTerminal", url: "https://www.geckoterminal.com/tron/pools/TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt" }],
	
	      // 4) Sun.io link
	      [{ text: "☀️ Sun.io Liquidity Pool", url: "https://sun.io/?lang=en-US#/scan/pairDetail?pairAddress=TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt&version=v3" }],
	
	      // 5) CoinMarketCap link
	      [{ text: "🔎 CoinMarketCap DexScan", url: "https://coinmarketcap.com/dexscan/tron/TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt/" }],
	
	      // 6) Existing button "View TX"
	      [{ text: "🔗 View TX", url: `https://tronscan.org/#/transaction/${txHash}` }]
	    ]
	  }
	};
    await sendLogToChannel(successMsg, inlineKeyboard);

    // 10) Webhook
    const webhookPayload = {
      success: true,
      tokenId: TOKEN_ID,
      amount0: amount0TRX.toFixed(6),
      amount1: amount1QSI.toFixed(6),
      txHash,
      time: currentTime
    };
    await sendWebhook(webhookPayload);

    return { success: true, txHash };
  } catch (error) {
    console.error("[ERROR] Liquidity addition failed:", error);
    const failMsg =
      `🚀 Liquidity Addition Report - Daily automatic Liquidity Addition\n\n` +
      `❌ Operation failed. Reason: ${error.message}\n` +
      `We will try again tomorrow.`;
    await sendLogToChannel(failMsg);
    return { success: false, error: error.message };
  }
}

module.exports = addLiquidity;
