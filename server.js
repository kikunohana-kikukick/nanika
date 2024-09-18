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

// クライアント接続時の処理
wss.on('connection', (ws) => {
  let roomID = null;
  let playerSymbol = null;

  // WebSocketの処理（既存のコード）...
});

// 静的ファイルを提供
app.use(express.static('public'));

// サーバーのポート
server.listen(3000, () => {
  console.log('HTTPS WebSocket server started on port 3000');
});
