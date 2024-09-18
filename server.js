const fs = require('fs');
const https = require('https');
const express = require('express');
const WebSocket = require('ws');

const app = express();

// HTTPS サーバーの作成
const server = https.createServer({
  key: fs.readFileSync('key.pem'),  // 秘密鍵
  cert: fs.readFileSync('cert.pem') // 証明書
}, app);

const wss = new WebSocket.Server({ server });

// 静的ファイルを提供
app.use(express.static('public'));

// サーバー起動
server.listen(3000, () => {
  console.log('HTTPS Server started on port 3000');
});
