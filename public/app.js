import getConnectedSocket from './src/socket/getConnectedSocket.js';

const socket = await getConnectedSocket();
if (!socket) throw new Error('');

console.log(socket);
