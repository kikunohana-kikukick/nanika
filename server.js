const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ルームの管理オブジェクト
let rooms = {};

// 静的ファイルを提供 (クライアントの HTML, CSS, JS を提供)
app.use(express.static('public'));

// WebSocket サーバーの処理
wss.on('connection', (ws) => {
    let roomID = null;
    let playerSymbol = null;

    ws.isAlive = true; // クライアントが接続しているかを確認するためのフラグ

    // クライアントからのメッセージを受信
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'createRoom':
                    roomID = generateRoomID();
                    rooms[roomID] = { players: [ws], gameState: Array(9).fill(null) };
                    playerSymbol = 'O'; // ルームを作ったプレイヤーは "O"
                    ws.send(JSON.stringify({ type: 'roomCreated', roomID }));
                    break;

                case 'joinRoom':
                    roomID = data.roomID;
                    if (rooms[roomID] && rooms[roomID].players.length < 2) {
                        playerSymbol = 'X'; // 2人目のプレイヤーは "X"
                        rooms[roomID].players.push(ws);
                        startGame(roomID); // ゲーム開始
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'Room is full or does not exist' }));
                    }
                    break;

                case 'makeMove':
                    if (rooms[roomID]) {
                        const { gameState } = rooms[roomID];
                        if (gameState[data.index] === null) {
                            gameState[data.index] = playerSymbol;
                            broadcastMove(roomID, data.index, playerSymbol);
                            checkGameEnd(roomID);
                        } else {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
                        }
                    }
                    break;

                case 'exitGame':
                    exitRoom(roomID, ws);
                    break;

                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
                    break;
            }
        } catch (e) {
            console.error('Invalid message received:', message);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('pong', () => {
        ws.isAlive = true; // クライアントからの応答で接続が生きていることを確認
    });

    // クライアントが切断されたときの処理
    ws.on('close', () => {
        exitRoom(roomID, ws);
    });

    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
    });
});

// 定期的に接続が生きているかチェックする
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('Terminating inactive connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // 30秒毎にチェック

// ルームIDの生成
function generateRoomID() {
    return Math.random().toString(36).substring(2, 9);
}

// ゲーム開始時にプレイヤーに通知
function startGame(roomID) {
    rooms[roomID].players.forEach((player, index) => {
        const symbol = index === 0 ? 'O' : 'X';
        player.send(JSON.stringify({ type: 'startGame', symbol }));
    });
}

// ゲームの状態をすべてのプレイヤーに送信
function broadcastMove(roomID, index, symbol) {
    rooms[roomID].players.forEach(player => {
        player.send(JSON.stringify({ type: 'moveMade', index, symbol }));
    });
}

// ゲームが終了したかどうかをチェック
function checkGameEnd(roomID) {
    const { gameState } = rooms[roomID];
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // 勝敗判定
    for (const [a, b, c] of winningCombinations) {
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            broadcastGameEnd(roomID, gameState[a]);
            return;
        }
    }

    // 引き分け判定
    if (gameState.every(cell => cell !== null)) {
        broadcastGameEnd(roomID, 'draw');
    }
}

// 勝敗の通知
function broadcastGameEnd(roomID, result) {
    rooms[roomID].players.forEach(player => {
        player.send(JSON.stringify({ type: 'gameEnd', result }));
    });
}

// ルームからの退出処理
function exitRoom(roomID, ws) {
    if (roomID && rooms[roomID]) {
        rooms[roomID].players = rooms[roomID].players.filter(player => player !== ws);
        console.log(`Player exited room: ${roomID}, remaining players: ${rooms[roomID].players.length}`);
        if (rooms[roomID].players.length === 0) {
            delete rooms[roomID]; // ルームを削除
            console.log(`Room ${roomID} deleted`);
        }
    }
}

// サーバーをポート 8080 で起動
const PORT = 8080; // ポート番号を変更したい場合はここを変更
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
