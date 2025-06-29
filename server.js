import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import getServerIP from './network/getServerIP.js';
import serveStatic from './midwares/serveStatic.js';
import initSocketServer from './network/socket/initSocket.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = process.env.PUBLIC_PATH;
const ASSETS_PATH = process.env.ASSETS_PATH;

const app = express();
const server = http.createServer(app);

// Serve static
app.use(`/`, serveStatic(PUBLIC_PATH));
app.use(`/${ASSETS_PATH}/`, serveStatic(ASSETS_PATH));
app.use('/libs/socket.io.js', serveStatic('./node_modules/socket.io-client/dist/socket.io.esm.min.js'));

// Init socket.io
const io = initSocketServer(server);

server
	.listen(PORT, () => {
		console.log(`> [Server] Server is up and running on: http://${getServerIP()}:${PORT}`);
	})
	.on('close', () => {
		io.disconnectSockets(true);
	});
