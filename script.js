// WebSocket接続を作成
let socket = new WebSocket('ws://localhost:8080/'); // サーバーアドレスに合わせてポートを設定

let playerSymbol = null;
let isConnected = false;

// WebSocket接続が確立された時に呼ばれる
socket.addEventListener('open', (event) => {
    isConnected = true;
    console.log('WebSocket connection established.');

    // 接続が確立された後にボタンを有効化
    document.getElementById('createRoom').disabled = false;
    document.getElementById('joinRoom').disabled = false;
    document.getElementById('exitGame').disabled = false;

    // "createRoom" ボタンのクリックイベント
    document.getElementById('createRoom').addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'createRoom' }));
        } else {
            console.error('WebSocket is not connected yet.');
        }
    });

    // "joinRoom" ボタンのクリックイベント
    document.getElementById('joinRoom').addEventListener('click', () => {
        const roomID = document.getElementById('roomID').value;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'joinRoom', roomID }));
        } else {
            console.error('WebSocket is not connected yet.');
        }
    });

    // "exitGame" ボタンのクリックイベント
    document.getElementById('exitGame').addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'exitGame' }));
            showLobby();
        } else {
            console.error('WebSocket is not connected yet.');
        }
    });

    // 各セルのクリックイベント (ゲームのマスをクリックした時)
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', () => {
            if (socket.readyState === WebSocket.OPEN && cell.textContent === '' && playerSymbol) {
                const index = cell.getAttribute('data-index');
                socket.send(JSON.stringify({ type: 'makeMove', index }));
            } else if (!isConnected) {
                console.error('WebSocket is not connected yet.');
            }
        });
    });
});

// WebSocketエラーハンドリング
socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
});

// WebSocket接続が閉じられた時の処理
socket.addEventListener('close', (event) => {
    isConnected = false;
    console.log('WebSocket connection closed:', event);

    // WebSocket接続が閉じられた後にボタンを無効化
    document.getElementById('createRoom').disabled = true;
    document.getElementById('joinRoom').disabled = true;
    document.getElementById('exitGame').disabled = true;
});

// サーバーからのメッセージ受信
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'roomCreated':
            document.getElementById('roomID').value = data.roomID;
            break;

        case 'startGame':
            playerSymbol = data.symbol;
            showGame();
            break;

        case 'moveMade':
            document.querySelector(`.cell[data-index="${data.index}"]`).textContent = data.symbol;
            break;

        case 'gameEnd':
            document.getElementById('gameStatus').textContent = data.result === 'draw' ? '引き分けです！' : `${data.result} の勝ちです！`;
            break;

        case 'error':
            document.getElementById('errorMessage').textContent = data.message;
            break;
    }
});

// ロビー画面を表示する関数
function showLobby() {
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
}

// ゲーム画面を表示する関数
function showGame() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
}
