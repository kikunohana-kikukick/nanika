const socket = new WebSocket('ws://localhost:8080');
let symbol = '';
let roomId = '';

document.getElementById('createRoomBtn').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'create_room' }));
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const roomIdInput = document.getElementById('roomIdInput').value;
    if (roomIdInput) {
        socket.send(JSON.stringify({ type: 'join_room', roomId: roomIdInput }));
    }
});

document.getElementById('leaveGameBtn').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'leave_room' }));
    document.getElementById('game').classList.add('hidden');
    document.getElementById('lobby').classList.remove('hidden');
});

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        if (!cell.textContent && symbol) {
            socket.send(JSON.stringify({ type: 'make_move', position: index }));
        }
    });
});

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
