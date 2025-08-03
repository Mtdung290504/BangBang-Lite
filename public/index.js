const ROOM_ID = new URLSearchParams(location.search).get('room')?.trim();

if (ROOM_ID) {
	const playerName = prompt('Nhập tên:');
	if (ROOM_ID && playerName.trim()) (await import('./src/initializer/app.js')).init(ROOM_ID, playerName);
	else location.href = '/';
} else (await import('./src/initializer/sandbox.js')).init();
