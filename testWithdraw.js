const withdrawLiquidity = require('./contracts/withdrawLiquidity');

const testWithdrawal = async () => {
  try {
    const result = await withdrawLiquidity();
    console.log('Withdrawal result:', result);
  } catch (error) {
    console.error('Test withdrawal failed:', error);
  }
};

testWithdrawal();
