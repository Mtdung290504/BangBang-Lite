const ROOM_ID = new URLSearchParams(location.search).get('room');

if (ROOM_ID) (await import('./app.js')).init();
else (await import('./sandbox.js')).init();
