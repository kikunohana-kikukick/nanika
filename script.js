const socket = new WebSocket('ws://localhost:8080/'); // サーバーと同じポートに合わせる

let isConnected = false;
let playerSymbol = null;

// WebSocket接続が確立されたときに呼ばれる
socket.addEventListener('open', () => {
  isConnected = true;
  console.log('WebSocket connection established.');
});

document.getElementById('createRoom').addEventListener('click', () => {
  if (isConnected) {
    socket.send(JSON.stringify({ type: 'createRoom' }));
  } else {
    console.error('WebSocket is not connected yet.');
  }
});

document.getElementById('joinRoom').addEventListener('click', () => {
  if (isConnected) {
    const roomID = document.getElementById('roomID').value;
    socket.send(JSON.stringify({ type: 'joinRoom', roomID }));
  } else {
    console.error('WebSocket is not connected yet.');
  }
});

document.getElementById('exitGame').addEventListener('click', () => {
  if (isConnected) {
    socket.send(JSON.stringify({ type: 'exitGame' }));
    showLobby();
  } else {
    console.error('WebSocket is not connected yet.');
  }
});

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    if (isConnected && cell.textContent === '' && playerSymbol) {
      const index = cell.getAttribute('data-index');
      socket.send(JSON.stringify({ type: 'makeMove', index }));
    } else if (!isConnected) {
      console.error('WebSocket is not connected yet.');
    }
  });
});

// サーバーからのメッセージを受信
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

// ロビー画面の表示
function showLobby() {
  document.getElementById('lobby').style.display = 'block';
  document.getElementById('game').style.display = 'none';
}

// ゲーム画面の表示
function showGame() {
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'block';
}

// WebSocket接続が閉じられたときの処理
socket.addEventListener('close', () => {
  isConnected = false;
  console.error('WebSocket connection closed.');
});

// エラーハンドリング
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
