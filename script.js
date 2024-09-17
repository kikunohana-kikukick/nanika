let socket;
let symbol = '';
let roomId = '';

function connectWebSocket() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function() {
        console.log('WebSocket接続が確立されました。');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'room_created':
                roomId = data.roomId;
                document.getElementById('lobby').classList.add('hidden');
                document.getElementById('game').classList.remove('hidden');
                break;

            case 'start_game':
                symbol = data.symbol;
                document.getElementById('lobby').classList.add('hidden');
                document.getElementById('game').classList.remove('hidden');
                break;

            case 'move_made':
                const cell = document.querySelector(`.cell[data-index="${data.position}"]`);
                cell.textContent = data.symbol;
                break;

            case 'left_room':
                document.getElementById('game').classList.add('hidden');
                document.getElementById('lobby').classList.remove('hidden');
                break;

            case 'error':
                document.getElementById('error').textContent = data.message;
                document.getElementById('error').classList.remove('hidden');
                break;
        }
    };

    socket.onclose = function() {
        console.log('WebSocket接続が閉じられました。');
        setTimeout(connectWebSocket, 1000); // 再接続
    };

    socket.onerror = function(error) {
        console.error('WebSocketエラー:', error);
    };
}

connectWebSocket();
