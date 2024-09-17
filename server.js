const WebSocket = require('ws');
const http = require('http');

// HTTPサーバーを作成
const server = http.createServer();
const wss = new WebSocket.Server({
    server,
    perMessageDeflate: false  // 圧縮を無効化
});

let rooms = {};  // ルームを格納
let players = {}; // プレイヤーの状態

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'create_room':
                const roomId = 'room_' + Date.now();
                rooms[roomId] = [ws]; 
                players[ws] = { roomId, symbol: 'X' }; 
                ws.send(JSON.stringify({ type: 'room_created', roomId }));
                break;

            case 'join_room':
                if (rooms[data.roomId] && rooms[data.roomId].length === 1) {
                    rooms[data.roomId].push(ws);
                    players[ws] = { roomId: data.roomId, symbol: 'O' };
                    rooms[data.roomId].forEach(player => player.send(JSON.stringify({ type: 'start_game' })));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room is full or does not exist.' }));
                }
                break;

            case 'make_move':
                const room = rooms[players[ws].roomId];
                room.forEach(player => player.send(JSON.stringify({ type: 'move_made', position: data.position, symbol: players[ws].symbol })));
                break;

            case 'leave_room':
                const leaveRoomId = players[ws].roomId;
                rooms[leaveRoomId] = rooms[leaveRoomId].filter(player => player !== ws);
                ws.send(JSON.stringify({ type: 'left_room' }));
                break;
        }
    });

    ws.on('close', function close() {
        const playerInfo = players[ws];
        if (playerInfo) {
            const { roomId } = playerInfo;
            rooms[roomId] = rooms[roomId].filter(player => player !== ws);
        }
    });
});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
