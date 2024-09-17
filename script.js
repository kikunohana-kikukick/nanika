let socket;
let symbol = '';
let roomId = '';

// WebSocket接続を初期化する関数
function connectWebSocket() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function() {
        console.log('WebSocket接続が確立されました。');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
            // ルーム作成後の処理
            case 'room_created':
                roomId = data.roomId;
                document.getElementById('lobby').classList.add('hidden');
                document.getElementById('game').classList.remove('hidden');
                break;

            // ゲーム開始時の処理
            case 'start_game':
                symbol = data.symbol;
                document.getElementById('lobby').classList.add('hidden');
                document.getElementById('game').classList.remove('hidden');
                break;

            // 対戦相手の動きが反映された場合の処理
            case 'move_made':
                const cell = document.querySelector(`.cell[data-index="${data.position}"]`);
                cell.textContent = data.symbol;
                break;

            // ルームを退出した場合の処理
            case 'left_room':
                document.getElementById('game').classList.add('hidden');
                document.getElementById('lobby').classList.remove('hidden');
                break;

            // エラー発生時の処理
            case 'error':
                document.getElementById('error').textContent = data.message;
                document.getElementById('error').classList.remove('hidden');
                break;
        }
    };

    socket.onclose = function() {
        console.log('WebSocket接続が閉じられました。');
        setTimeout(connectWebSocket, 1000); // 1秒後に再接続
    };

    socket.onerror = function(error) {
        console.error('WebSocketエラー:', error);
    };
}

// 初回WebSocket接続を呼び出し
connectWebSocket();

// ルーム作成ボタンのイベント
document.getElementById('createRoomBtn').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'create_room' }));
});

// ルーム参加ボタンのイベント
document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const roomIdInput = document.getElementById('roomIdInput').value;
    if (roomIdInput) {
        socket.send(JSON.stringify({ type: 'join_room', roomId: roomIdInput }));
    }
});

// ロビーに戻るボタンのイベント
document.getElementById('leaveGameBtn').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'leave_room' }));
    document.getElementById('game').classList.add('hidden');
    document.getElementById('lobby').classList.remove('hidden');
});

// まるばつゲーム盤面のセルクリックイベント
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        if (!cell.textContent && symbol) {
            socket.send(JSON.stringify({ type: 'make_move', position: index }));
        }
    });
});
