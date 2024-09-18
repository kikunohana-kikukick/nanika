// server.js

// 必要なモジュールを読み込む
const https = require('https'); // HTTPSモジュール
const fs = require('fs');       // ファイルシステムモジュール
const path = require('path');   // ファイルパス操作用

// 証明書と秘密鍵のファイルパスを指定して読み込む
const options = {
    key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),  // 秘密鍵
    cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')), // 証明書
    // passphrase: 'YOUR_PASSPHRASE_HERE', // 鍵にパスフレーズが必要な場合はこれを設定する
    // ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem')) // 中間証明書がある場合は追加
};

// サーバーのリクエストハンドリング
https.createServer(options, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' }); // ヘッダーの設定
    res.end('Hello Secure World!\n'); // レスポンスの送信
}).listen(3000, () => {
    console.log('HTTPS Server running on https://localhost:3000');
});
