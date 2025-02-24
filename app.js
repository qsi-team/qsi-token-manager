// app.js

const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// Import routes
const withdrawRoutes = require('./routes/withdrawRoutes');
const addLiquidityRoutes = require('./routes/addLiquidityRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Middleware
app.use(express.json());

// Mount routes
app.use('/', statusRoutes);
app.use('/', withdrawRoutes);
app.use('/', addLiquidityRoutes);

// Updated root endpoint with detailed HTML page and useful links
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>QS Token Manager API</title>
      <style>
        body {
          background-color: #fff;
          color: #000;
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        h1 {
          font-size: 2.5em;
          margin-bottom: 0.5em;
        }
        h2 {
          font-size: 1.8em;
          margin-top: 1.5em;
        }
        a {
          color: rgb(100, 100, 100);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 0.8em;
        }
        .container {
          max-width: 800px;
          margin: auto;
        }
        .footer {
          margin-top: 2em;
          font-size: 0.9em;
          color: rgb(100, 100, 100);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>QS Token Manager API</h1>
        <p>The QS Token Manager API automates liquidity management for QSI tokens using SUN IO API support.</p>
        
        <h2>Available Endpoints</h2>
        <ul>
          <li><strong>Status:</strong> <a href="/status" target="_blank">/status</a> – Public status page.</li>
          <li><strong>Withdraw Liquidity:</strong> POST to <a href="/withdraw" target="_blank">/withdraw</a> (protected).</li>
          <li><strong>Add Liquidity:</strong> POST to <a href="/addLiquidity" target="_blank">/addLiquidity</a> (protected).</li>
        </ul>
        
        <h2>Useful Links</h2>
        <ul>
          <li><a href="https://www.geckoterminal.com/tron/pools/TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt" target="_blank">GeckoTerminal - Liquidity Pool</a></li>
          <li><a href="https://sun.io/?lang=en-US#/scan/pairDetail?pairAddress=TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt&version=v3" target="_blank">Sun.io Liquidity Pool</a></li>
          <li><a href="https://coinmarketcap.com/dexscan/tron/TCGYUS35aVemngWEbLfX5FmrktcsRuHGbt/" target="_blank">CoinMarketCap DexScan</a></li>
          <li><a href="https://quickshooters.com/about-qsi" target="_blank">About QSI</a></li>
          <li><a href="https://quickshooters.com/whitepaper" target="_blank">Whitepaper</a></li>
          <li><a href="https://quickshooters.com/tokenomics" target="_blank">Tokenomics</a></li>
          <li><a href="https://quickshooters.com/roadmap" target="_blank">Roadmap</a></li>
          <li><a href="https://quickshooters.com/buyqsi" target="_blank">Buy QSI</a></li>
          <li><a href="https://t.me/QuickShootersIncorporated" target="_blank">Telegram Channel</a></li>
          <li><a href="https://x.com/QuickShooters" target="_blank">X (Twitter)</a></li>
        </ul>
        
        <div class="footer">
          <p>Powered by SUN IO API. Developed by Quick Shooters Incorporated.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
