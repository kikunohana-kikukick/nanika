const socket = new WebSocket('ws://localhost:8080/'); // サーバーと同じポートに合わせる

let playerSymbol = null;

// ボタンを無効化
document.getElementById('createRoom').disabled = true;
document.getElementById('joinRoom').disabled = true;
document.getElementById('exitGame').disabled = true;

// WebSocket接続が確立されたときの処理
socket.addEventListener('open', () => {
  console.log('WebSocket connection established.');
  
  // 接続が確立されたらボタンを有効化
  document.getElementById('createRoom').disabled = false;
  document.getElementById('joinRoom').disabled = false;
  document.getElementById('exitGame').disabled = false;
});

document.getElementById('createRoom').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'createRoom' }));
});

document.getElementById('joinRoom').addEventListener('click', () => {
  const roomID = document.getElementById('roomID').value;
  socket.send(JSON.stringify({ type: 'joinRoom', roomID }));
});

document.getElementById('exitGame').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'exitGame' }));
  showLobby();
});

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    if (cell.textContent === '' && playerSymbol) {
      const index = cell.getAttribute('data-index');
      socket.send(JSON.stringify({ type: 'makeMove', index }));
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

// WebSocket接続が閉じられたときの処理
socket.addEventListener('close', () => {
  console.error('WebSocket connection closed.');
  // ボタンを再び無効化する
  document.getElementById('createRoom').disabled = true;
  document.getElementById('joinRoom').disabled = true;
  document.getElementById('exitGame').disabled = true;
});

// エラーハンドリング
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
