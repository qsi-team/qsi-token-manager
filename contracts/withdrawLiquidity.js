// contracts/withdrawLiquidity.js

const connectWallet = require('../wallet/walletConnect');
const sendLogToChannel = require('../telegram/sendTelegram'); // Function to send Telegram notifications
const sendWebhook = require('../webhook/sendWebhook'); // Function to send webhook notifications
require('dotenv').config();

const MIN_BALANCE = 500 * 1e6; // 500 TRX expressed in SUN

/**
 * Withdraw liquidity from the contract if the balance exceeds the minimum threshold.
 * Also transfers 5% of the withdrawn balance as expense.
 *
 * @returns {Promise<Object>} Object with transaction information and status.
 */
const withdrawLiquidity = async () => {
  try {
    const tronWeb = connectWallet();
    const contractAddress = process.env.QSI_TOKEN_ADDRESS; // QSI contract address
    const expenseWallet = process.env.EXPENSE_WALLET; // Expense wallet address
    const managingWallet = tronWeb.defaultAddress.base58; // Managing wallet address

    // Get contract balance in SUN
    const balanceSun = await tronWeb.trx.getBalance(contractAddress);
    const balanceTRX = (balanceSun / 1e6).toFixed(2);
    console.log(`[INFO] Contract balance: ${balanceTRX} TRX`);

    const currentTime = new Date().toISOString();

    // If balance is insufficient, send insufficient notification
    if (balanceSun <= MIN_BALANCE) {
      console.log(
        `[INFO] ⚠️ Balance below threshold (${(MIN_BALANCE / 1e6).toFixed(2)} TRX). Withdrawal postponed until tomorrow.`
      );

      // Prepare Telegram message for insufficient balance
      const telegramMessage = `💰 Contract Balance: ${balanceTRX} TRX\n` +
        `⚠️ *Insufficient balance for withdrawal (500.00 TRX required). Withdrawal postponed until tomorrow.*`;

      // Inline keyboard for insufficient result (buttons on separate lines)
      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💰 Buy QSI Directly", url: "https://quickshooters.com/buyqsi" }],
            [{ text: "⏳ QSI Lock & Unlock Timeline", url: "https://quickshooters.com/swapqsi" }]
          ]
        }
      };

      await sendLogToChannel(telegramMessage, inlineKeyboard);

      // Prepare webhook payload for insufficient balance
      const webhookPayload = {
        type: "withdrawal",
        report: "Liquidity Withdrawal Report - Daily automatic withdrawal from QSI contract balance",
        status: "insufficient",
        timestamp: currentTime,
        balanceBefore: balanceTRX,
        message: "Insufficient balance for withdrawal (500.00 TRX required). Withdrawal postponed until tomorrow."
      };
      await sendWebhook(webhookPayload);

      return { success: false, message: `Balance too low: ${balanceTRX} TRX. Withdrawal postponed until tomorrow.` };
    }

    console.log(`[INFO] Balance exceeds threshold. Initiating withdrawal...`);

    // Get contract instance and call withdrawLiquidity method
    const contract = await tronWeb.contract().at(contractAddress);
    const withdrawalTx = await contract.withdrawLiquidity(balanceSun).send({
      feeLimit: 100_000_000,
    });
    const withdrawalTxId = withdrawalTx.txid || withdrawalTx;
    console.log(`[INFO] Liquidity withdrawn. TX: ${withdrawalTxId}`);

    // Calculate 5% expense
    const expensesSun = Math.floor(balanceSun * 0.05);

    // Transfer expense funds
    const expenseTx = await tronWeb.trx.sendTransaction(expenseWallet, expensesSun);
    const expenseTxId = expenseTx.txid || expenseTx;
    console.log(`[INFO] Expense transaction sent: ${(expensesSun / 1e6).toFixed(2)} TRX. TX: ${expenseTxId}`);

    // Use constant values for energy and bandwidth
    const energyUsed = "7,361";    // Constant energy value in TRX
    const bandwidthUsed = "313";   // Constant bandwidth value in TRX

    // Prepare transaction info object
    const txInfo = {
      timestamp: currentTime,
      balanceBefore: balanceTRX,
      withdrawalTx: withdrawalTxId,
      expenseTx: expenseTxId,
      expenseAmountTRX: (expensesSun / 1e6).toFixed(2),
      energyUsed,       // Energy cost in TRX (constant)
      bandwidthUsed     // Bandwidth cost in TRX (constant)
    };

    // Prepare Telegram message text for positive result (plain text, no links)
    const telegramMessage = `🚀 Liquidity Withdrawal Report - Daily automatic withdrawal from QSI contract balance\n\n` +
      `💰 Contract Balance Before Withdrawal: ${txInfo.balanceBefore} TRX\n` +
      `💲 Withdrawn: ${txInfo.balanceBefore} TRX\n` +
      `🔋 Energy & Taxes: Energy: ${txInfo.energyUsed} , Bandwidth: ${txInfo.bandwidthUsed} \n` +
      `💸 Expense Transaction (5%): ${txInfo.expenseAmountTRX} TRX\n` +
      `⏰ Time: ${txInfo.timestamp}`;

    // Prepare inline keyboard for positive result (each button on a new line)
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💰 Buy QSI Directly", url: "https://quickshooters.com/buyqsi" }],
          [{ text: "⏳ QSI Lock & Unlock Timeline", url: "https://quickshooters.com/swapqsi" }],
          [{ text: "Withdrawal TX", url: `https://tronscan.org/#/transaction/${txInfo.withdrawalTx}` }],
          [{ text: "Expense TX (5%)", url: `https://tronscan.org/#/transaction/${txInfo.expenseTx}` }],
          [{ text: "Managing Wallet", url: `https://tronscan.org/#/address/${managingWallet}` }]
        ]
      }
    };

    // Send Telegram notification for positive result
    await sendLogToChannel(telegramMessage, inlineKeyboard);

    // Prepare webhook payload for successful withdrawal
    const webhookPayload = {
      type: "withdrawal",
      report: "Liquidity Withdrawal Report - Daily automatic withdrawal from QSI contract balance",
      status: "success",
      timestamp: txInfo.timestamp,
      balanceBefore: txInfo.balanceBefore,
      withdrawalTx: txInfo.withdrawalTx,
      expenseTx: txInfo.expenseTx,
      expenseAmountTRX: txInfo.expenseAmountTRX,
      energyUsed: txInfo.energyUsed,
      bandwidthUsed: txInfo.bandwidthUsed,
      managingWallet: managingWallet
    };

    // Send webhook notification
    await sendWebhook(webhookPayload);

    return { success: true, message: 'Liquidity withdrawn successfully!', txInfo };

  } catch (error) {
    console.error('[ERROR] Error during liquidity withdrawal:', error);
    throw error;
  }
};

module.exports = withdrawLiquidity;
