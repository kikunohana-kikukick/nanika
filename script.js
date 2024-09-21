// WebSocket接続を作成
let socket = new WebSocket('ws://localhost:8080/'); // サーバーアドレスに合わせてポートを設定

let playerSymbol = null;
let isConnected = false;
let reconnectInterval;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5; // 再接続の最大試行回数

// WebSocket接続が確立された時に呼ばれる
socket.addEventListener('open', (event) => {
    isConnected = true;
    reconnectAttempts = 0; // 再接続回数をリセット
    console.log('WebSocket connection established.');

    // 再接続の試行を停止
    clearInterval(reconnectInterval);

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
    document.getElementById('errorMessage').textContent = 'WebSocket エラーが発生しました。接続設定を確認してください。';
    console.log('エラーメッセージの詳細:', event); // エラーの詳細情報をログに記録
});

// WebSocket接続が閉じられた時の処理
socket.addEventListener('close', (event) => {
    isConnected = false;
    console.log('WebSocket connection closed:', event);
    document.getElementById('errorMessage').textContent = 'WebSocket 接続が切断されました。再接続を試みます。';

    // WebSocket接続が閉じられた後にボタンを無効化
    document.getElementById('createRoom').disabled = true;
    document.getElementById('joinRoom').disabled = true;
    document.getElementById('exitGame').disabled = true;

    // 再接続を試みる（上限回数まで）
    if (reconnectAttempts < maxReconnectAttempts) {
        reconnectInterval = setInterval(() => {
            if (!isConnected) {
                reconnectAttempts++;
                console.log(`再接続を試みます... (${reconnectAttempts}/${maxReconnectAttempts})`);
                socket = new WebSocket('ws://localhost:8080/'); // サーバーアドレスに合わせて再接続
                socket.addEventListener('open', () => {
                    console.log('再接続に成功しました。');
                    document.getElementById('errorMessage').textContent = ''; // エラーメッセージをクリア
                    clearInterval(reconnectInterval);
                });
                socket.addEventListener('error', (event) => {
                    console.error('再接続中の WebSocket エラー:', event);
                });
            } else {
                clearInterval(reconnectInterval);
            }
        }, 5000); // 5秒ごとに再接続を試みる
    } else {
        document.getElementById('errorMessage').textContent = '再接続に失敗しました。サーバーの状態を確認してください。';
    }
});

// サーバーからのメッセージ受信
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Received message:', data); // デバッグ用: サーバーから受け取ったメッセージを表示

    switch (data.type) {
        case 'roomCreated':
            console.log('Room created with ID:', data.roomID); // デバッグ用: ルームIDを表示
            document.getElementById('roomID').value = data.roomID;
            document.getElementById('errorMessage').textContent = ''; // エラーメッセージをクリア
            break;

        case 'startGame':
            playerSymbol = data.symbol;
            document.getElementById('errorMessage').textContent = ''; // エラーメッセージをクリア
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

        default:
            console.error('不明なメッセージタイプを受信しました:', data.type);
            break;
    }
});

// ロビー画面を表示する関数
function showLobby() {
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    clearBoard(); // ゲームボードをクリア
}

// ゲーム画面を表示する関数
function showGame() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
}

// ゲームボードをクリアする関数
function clearBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
    });
}

// ウィンドウが閉じられるときにWebSocket接続を閉じる
window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.close();
    }
});
