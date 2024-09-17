// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

let rooms = {};  // 各ゲームの部屋の管理

// 新しい接続があったときの処理
io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // 部屋に参加
    socket.on('joinGame', (room) => {
        socket.join(room);
        if (!rooms[room]) rooms[room] = { players: [], board: Array(9).fill(null), turn: 'X' };
        rooms[room].players.push(socket.id);

        if (rooms[room].players.length === 2) {
            io.to(room).emit('startGame', rooms[room].turn);  // ゲーム開始
        }
    });

    // 盤面の更新
    socket.on('makeMove', ({ room, index }) => {
        let game = rooms[room];
        if (!game || game.board[index] !== null) return;

        game.board[index] = game.turn;
        game.turn = game.turn === 'X' ? 'O' : 'X';  // ターンを交代
        io.to(room).emit('updateBoard', game.board, game.turn);

        // 勝利チェック（省略した関数を後ほど追加）
        const winner = checkWinner(game.board);
        if (winner) {
            io.to(room).emit('gameOver', winner);
            rooms[room] = null;  // ゲームをリセット
        }
    });
});

// サーバーを起動
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// 勝利条件のチェック
function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
        [0, 4, 8], [2, 4, 6]  // 斜め
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes(null) ? null : 'draw';
}
