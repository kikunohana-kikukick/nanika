const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const express = require('express');
const app = express();

// HTTPSサーバーの作成
const server = https.createServer({
  key: fs.readFileSync('key.pem'),  // 秘密鍵
  cert: fs.readFileSync('cert.pem') // 証明書
}, app);

const wss = new WebSocket.Server({ server });

// WebSocket の処理を記述（既存のコードをここに入れる）

// 静的ファイルを提供
app.use(express.static('public'));

// HTTPS サーバーをポート 3000 でリッスン
server.listen(3000, () => {
  console.log('Secure WebSocket server started on port 3000');
});
